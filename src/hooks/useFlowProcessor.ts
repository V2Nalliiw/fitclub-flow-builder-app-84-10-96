
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
  // Question-specific fields
  pergunta?: string;
  tipoResposta?: 'escolha-unica' | 'multipla-escolha' | 'texto-livre';
  opcoes?: string[];
  // Form-specific fields
  formId?: string;
  tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
  arquivo?: string;
  mensagemFinal?: string;
  // Delay-specific fields
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
      // Get flow data
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('name')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      // Process nodes to create steps sequence
      const steps = await processNodesSequence(nodes, edges);
      
      if (steps.length === 0) {
        throw new Error('Nenhuma etapa válida encontrada no fluxo');
      }

      console.log('Processed steps:', steps);

      // Create flow execution with proper structure
      // Convert FlowStep[] to Json-compatible format
      const currentStepData = {
        steps: steps.map(step => ({
          ...step,
          // Ensure all properties are JSON-serializable
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
          current_step: currentStepData as any, // Cast to any for Json compatibility
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
    
    // Find start node
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('Fluxo deve ter um nó de início');
    }

    // Traverse the flow following connections
    let currentNodeId = startNode.id;
    let order = 1;

    const processedNodes = new Set<string>(); // Prevent infinite loops

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

      // Process delays
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
