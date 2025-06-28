
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
          flow_name: flow.name,
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
          },
        })
        .select()
        .single();

      if (executionError) {
        throw executionError;
      }

      // Criar steps individuais
      const flowSteps = steps.map(step => ({
        execution_id: execution.id,
        node_id: step.nodeId,
        node_type: step.nodeType,
        title: step.title,
        description: step.description,
        status: step.order === 1 ? 'disponivel' : 'pendente',
        available_at: step.availableAt.toISOString(),
        form_url: step.formId ? `${window.location.origin}/forms/${step.formId}?execution=${execution.id}` : null,
      }));

      const { error: stepsError } = await supabase
        .from('flow_steps')
        .insert(flowSteps);

      if (stepsError) {
        throw stepsError;
      }

      toast({
        title: "Fluxo iniciado",
        description: `O fluxo "${flow.name}" foi iniciado para o paciente`,
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
      // Marcar step como concluído
      const { error: stepError } = await supabase
        .from('flow_steps')
        .update({
          status: 'concluido',
          completed_at: new Date().toISOString(),
          response,
        })
        .eq('execution_id', executionId)
        .eq('node_id', stepId);

      if (stepError) {
        throw stepError;
      }

      // Buscar execução atual
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        throw new Error('Execução não encontrada');
      }

      // Atualizar progresso
      const newCompletedSteps = execution.completed_steps + 1;
      const newProgress = Math.round((newCompletedSteps / execution.total_steps) * 100);

      // Buscar próximo step disponível
      const { data: nextStep } = await supabase
        .from('flow_steps')
        .select('*')
        .eq('execution_id', executionId)
        .eq('status', 'pendente')
        .order('available_at', { ascending: true })
        .limit(1)
        .single();

      let updateData: any = {
        completed_steps: newCompletedSteps,
        progress: newProgress,
        updated_at: new Date().toISOString(),
      };

      if (nextStep) {
        // Ativar próximo step
        await supabase
          .from('flow_steps')
          .update({ status: 'disponivel' })
          .eq('id', nextStep.id);

        updateData.current_node = nextStep.node_id;
        updateData.current_step = {
          id: nextStep.node_id,
          type: nextStep.node_type,
          title: nextStep.title,
          description: nextStep.description,
          completed: false,
        };
        updateData.next_step_available_at = nextStep.available_at;
        updateData.status = new Date(nextStep.available_at) <= new Date() ? 'em-andamento' : 'aguardando';
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
