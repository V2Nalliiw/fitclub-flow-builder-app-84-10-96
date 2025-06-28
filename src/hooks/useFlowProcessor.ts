
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FlowNode, FlowEdge } from '@/types/flow';

interface FlowStep {
  nodeId: string;
  nodeType: string;
  title: string;
  description?: string;
  order: number;
  availableAt: Date;
  formId?: string;
  delayAmount?: number;
  delayType?: 'minutos' | 'horas' | 'dias';
}

export const useFlowProcessor = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const processFlowAssignment = useCallback(async (
    flowId: string, 
    patientId: string, 
    nodes: FlowNode[], 
    edges: FlowEdge[]
  ) => {
    setProcessing(true);
    
    try {
      // Primeiro, buscar dados do fluxo
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('name')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      // Processar nós para criar sequência de steps
      const steps = await processNodesSequence(nodes, edges);
      
      if (steps.length === 0) {
        throw new Error('Nenhuma etapa válida encontrada no fluxo');
      }

      // Criar execução do fluxo
      const { data: execution, error: executionError } = await supabase
        .from('flow_executions')
        .insert({
          flow_id: flowId,
          flow_name: (flow as any).name,
          patient_id: patientId,
          status: 'em-andamento',
          current_node: steps[0].nodeId,
          progress: 0,
          total_steps: steps.length,
          completed_steps: 0,
          current_step: {
            id: steps[0].nodeId,
            type: steps[0].nodeType,
            title: steps[0].title,
            description: steps[0].description,
            completed: false,
            steps: steps, // Store all steps in metadata
          },
        })
        .select()
        .single();

      if (executionError) {
        throw executionError;
      }

      toast({
        title: "Fluxo iniciado",
        description: `O fluxo "${(flow as any).name}" foi iniciado para o paciente`,
      });

      return execution;

    } catch (error) {
      console.error('Erro ao processar atribuição de fluxo:', error);
      toast({
        title: "Erro ao iniciar fluxo",
        description: "Não foi possível iniciar o fluxo para o paciente",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const processNodesSequence = async (nodes: FlowNode[], edges: FlowEdge[]): Promise<FlowStep[]> => {
    const steps: FlowStep[] = [];
    let currentDate = new Date();
    
    // Encontrar nó inicial
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('Fluxo deve ter um nó de início');
    }

    // Percorrer o fluxo seguindo as conexões
    let currentNodeId = startNode.id;
    let order = 1;

    while (currentNodeId) {
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) break;

      // Processar apenas nós que geram steps para o paciente
      if (['formStart', 'formSelect', 'question'].includes(currentNode.type)) {
        steps.push({
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          title: currentNode.data.titulo || currentNode.data.label || `${currentNode.type} ${order}`,
          description: currentNode.data.descricao,
          order,
          availableAt: new Date(currentDate),
          formId: currentNode.data.formId,
        });
        order++;
      }

      // Processar delays
      if (currentNode.type === 'delay') {
        const delayAmount = currentNode.data.quantidade || 1;
        const delayType = currentNode.data.tipoIntervalo || 'dias';
        
        switch (delayType) {
          case 'minutos':
            currentDate.setMinutes(currentDate.getMinutes() + delayAmount);
            break;
          case 'horas':
            currentDate.setHours(currentDate.getHours() + delayAmount);
            break;
          case 'dias':
          default:
            currentDate.setDate(currentDate.getDate() + delayAmount);
            break;
        }
      }

      // Encontrar próximo nó
      const nextEdge = edges.find(edge => edge.source === currentNodeId);
      currentNodeId = nextEdge ? nextEdge.target : null;

      // Evitar loops infinitos
      if (currentNode.type === 'end') break;
    }

    return steps;
  };

  const completeFlowStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    try {
      // Buscar execução atual
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        throw new Error('Execução não encontrada');
      }

      const executionData = execution as any;
      const currentSteps = executionData.current_step?.steps || [];
      
      // Encontrar o step atual e marcar como concluído
      const updatedSteps = currentSteps.map((step: any) => {
        if (step.nodeId === stepId) {
          return { ...step, completed: true, response };
        }
        return step;
      });

      // Encontrar próximo step disponível
      const nextStep = updatedSteps.find((step: any) => !step.completed);

      // Atualizar progresso
      const completedStepsCount = updatedSteps.filter((step: any) => step.completed).length;
      const newCompletedSteps = executionData.completed_steps + 1;
      const newProgress = Math.round((completedStepsCount / updatedSteps.length) * 100);

      let updateData: any = {
        completed_steps: newCompletedSteps,
        progress: newProgress,
        updated_at: new Date().toISOString(),
        current_step: {
          ...executionData.current_step,
          steps: updatedSteps
        }
      };

      if (nextStep) {
        // Ativar próximo step
        updateData.current_node = nextStep.nodeId;
        updateData.current_step.id = nextStep.nodeId;
        updateData.current_step.type = nextStep.nodeType;
        updateData.current_step.title = nextStep.title;
        updateData.current_step.description = nextStep.description;
        updateData.current_step.completed = false;
        updateData.next_step_available_at = nextStep.availableAt;
        updateData.status = new Date(nextStep.availableAt) <= new Date() ? 'em-andamento' : 'aguardando';
      } else {
        // Fluxo concluído
        updateData.status = 'concluido';
        updateData.completed_at = new Date().toISOString();
        updateData.progress = 100;
      }

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Etapa concluída",
        description: nextStep ? "Próxima etapa será disponibilizada no momento correto" : "Fluxo concluído com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast({
        title: "Erro ao completar etapa",
        description: "Não foi possível registrar a conclusão da etapa",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    processing,
    processFlowAssignment,
    completeFlowStep,
  };
};
