
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
  availableAt: string;
  completed: boolean;
  pergunta?: string;
  tipoResposta?: 'escolha-unica' | 'multipla-escolha' | 'texto-livre';
  opcoes?: string[];
  formId?: string;
  tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
  arquivo?: string;
  mensagemFinal?: string;
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
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('name')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      const steps = await processNodesSequence(nodes, edges);
      
      if (steps.length === 0) {
        throw new Error('Nenhuma etapa válida encontrada no fluxo');
      }

      console.log('Processed steps:', steps);

      // Create safe JSON structure for current_step
      const currentStepData = {
        steps: steps.map(step => ({
          nodeId: step.nodeId,
          nodeType: step.nodeType,
          title: step.title,
          description: step.description || null,
          order: step.order,
          availableAt: step.availableAt,
          completed: step.completed,
          pergunta: step.pergunta || null,
          tipoResposta: step.tipoResposta || null,
          opcoes: step.opcoes || null,
          formId: step.formId || null,
          tipoConteudo: step.tipoConteudo || null,
          arquivo: step.arquivo || null,
          mensagemFinal: step.mensagemFinal || null,
          delayAmount: step.delayAmount || null,
          delayType: step.delayType || null
        })),
        currentStepIndex: 0,
        totalSteps: steps.length
      };

      const { data: execution, error: executionError } = await supabase
        .from('flow_executions')
        .insert({
          flow_id: flowId,
          flow_name: flow.name,
          patient_id: patientId,
          status: 'pending',
          current_node: steps[0].nodeId,
          progress: 0,
          total_steps: steps.length,
          completed_steps: 0,
          current_step: currentStepData,
          next_step_available_at: steps[0].availableAt
        })
        .select()
        .single();

      if (executionError) {
        console.error('Erro ao criar execução:', executionError);
        throw executionError;
      }

      toast({
        title: "Fluxo iniciado",
        description: `O fluxo "${flow.name}" foi iniciado com sucesso`,
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
    
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('Fluxo deve ter um nó de início');
    }

    let currentNodeId = startNode.id;
    let order = 1;
    const processedNodes = new Set<string>();

    while (currentNodeId && !processedNodes.has(currentNodeId)) {
      processedNodes.add(currentNodeId);
      
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) break;

      // Process nodes that generate steps for the patient
      if (['formStart', 'formEnd', 'question'].includes(currentNode.type)) {
        const step: FlowStep = {
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          title: currentNode.data.titulo || currentNode.data.label || `${currentNode.type} ${order}`,
          description: currentNode.data.descricao,
          order,
          availableAt: currentDate.toISOString(),
          completed: false
        };

        // Add type-specific data
        if (currentNode.type === 'question') {
          step.pergunta = currentNode.data.pergunta;
          step.tipoResposta = currentNode.data.tipoResposta;
          step.opcoes = currentNode.data.opcoes;
        } else if (currentNode.type === 'formEnd') {
          step.tipoConteudo = currentNode.data.tipoConteudo;
          step.arquivo = currentNode.data.arquivo;
          step.mensagemFinal = currentNode.data.mensagemFinal;
        } else if (currentNode.type === 'formStart') {
          step.formId = currentNode.data.formId;
        }

        steps.push(step);
        order++;
      }

      // Process delays - add time to currentDate for subsequent steps
      if (currentNode.type === 'delay') {
        const delayAmount = currentNode.data.quantidade || 1;
        const delayType = currentNode.data.tipoIntervalo || 'dias';
        
        switch (delayType) {
          case 'minutos':
            currentDate = new Date(currentDate.getTime() + (delayAmount * 60 * 1000));
            break;
          case 'horas':
            currentDate = new Date(currentDate.getTime() + (delayAmount * 60 * 60 * 1000));
            break;
          case 'dias':
          default:
            currentDate = new Date(currentDate.getTime() + (delayAmount * 24 * 60 * 60 * 1000));
            break;
        }
      }

      // Find next node
      const nextEdge = edges.find(edge => edge.source === currentNodeId);
      currentNodeId = nextEdge ? nextEdge.target : null;

      // Break on end node
      if (currentNode.type === 'end') break;
    }

    return steps;
  };

  const completeFlowStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    try {
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        throw new Error('Execução não encontrada');
      }

      const currentStepData = execution.current_step as { steps?: any[]; currentStepIndex?: number } | null;
      const currentSteps = currentStepData?.steps || [];
      
      const updatedSteps = currentSteps.map((step: any) => {
        if (step.nodeId === stepId) {
          return { ...step, completed: true, response };
        }
        return step;
      });

      const nextStep = updatedSteps.find((step: any) => !step.completed);
      const completedStepsCount = updatedSteps.filter((step: any) => step.completed).length;
      const newProgress = Math.round((completedStepsCount / updatedSteps.length) * 100);

      let updateData: any = {
        completed_steps: completedStepsCount,
        progress: newProgress,
        updated_at: new Date().toISOString(),
        current_step: {
          ...currentStepData,
          steps: updatedSteps
        }
      };

      if (nextStep) {
        updateData.current_node = nextStep.nodeId;
        updateData.current_step.currentStepIndex = updatedSteps.findIndex((s: any) => s.nodeId === nextStep.nodeId);
        updateData.next_step_available_at = nextStep.availableAt;
        updateData.status = new Date(nextStep.availableAt) <= new Date() ? 'pending' : 'waiting';
      } else {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        updateData.progress = 100;
        updateData.current_step.currentStepIndex = -1;
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
