
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
  canGoBack?: boolean;
  pergunta?: string;
  tipoResposta?: 'escolha-unica' | 'multipla-escolha' | 'texto-livre';
  opcoes?: string[];
  formId?: string;
  tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
  arquivo?: string;
  mensagemFinal?: string;
  delayAmount?: number;
  delayType?: 'minutos' | 'horas' | 'dias';
  calculatorFields?: any[];
  formula?: string;
  resultLabel?: string;
  conditions?: any[];
  calculatorResult?: number;
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
    console.log('🔄 FlowProcessor: Processando atribuição de fluxo', { flowId, patientId, nodes: nodes.length, edges: edges.length });
    setProcessing(true);
    
    try {
      // Find start node and create proper flow sequence
      const startNode = nodes.find(node => node.type === 'start');
      if (!startNode) {
        throw new Error('Nó de início não encontrado no fluxo');
      }

      // Get flow name
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('name')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      // Build execution steps based on flow structure
      const steps = buildFlowSteps(nodes, edges, startNode);
      console.log('📋 FlowProcessor: Steps construídos:', steps);

      if (steps.length === 0) {
        throw new Error('Nenhuma etapa válida encontrada no fluxo');
      }

      // Create the flow execution with proper step structure
      const executionData = {
        flow_id: flowId,
        flow_name: flow.name,
        patient_id: patientId,
        status: 'pending', // Start as pending, will be changed to in-progress by FormStart node
        current_node: startNode.id,
        progress: 0,
        total_steps: steps.length,
        completed_steps: 0,
        current_step: {
          steps: steps,
          currentStepIndex: 0,
          calculatorResults: {}
        },
        next_step_available_at: null
      };

      const { data: execution, error: executionError } = await supabase
        .from('flow_executions')
        .insert(executionData)
        .select()
        .single();

      if (executionError) {
        console.error('❌ FlowProcessor: Erro ao criar execução:', executionError);
        throw executionError;
      }

      console.log('✅ FlowProcessor: Execução criada com steps:', execution);

      toast({
        title: "Fluxo iniciado",
        description: `O fluxo "${flow.name}" foi iniciado com sucesso`,
      });

      return execution;

    } catch (error) {
      console.error('❌ FlowProcessor: Erro no processamento:', error);
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

  // Helper function to build steps from flow nodes
  const buildFlowSteps = (nodes: FlowNode[], edges: FlowEdge[], startNode: FlowNode) => {
    const steps: any[] = [];
    const visited = new Set<string>();
    
    const traverseFlow = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Skip start and end nodes in steps
      if (node.type !== 'start' && node.type !== 'end') {
        const step = {
          nodeId: node.id,
          nodeType: node.type,
          title: node.data.titulo || node.data.label || `Etapa ${steps.length + 1}`,
          description: node.data.descricao,
          pergunta: node.data.pergunta,
          opcoes: node.data.opcoes,
          tipoResposta: node.data.tipoResposta,
          tipoExibicao: node.data.tipoExibicao,
          arquivo: node.data.arquivo,
          arquivos: node.data.arquivos,
          mensagemFinal: node.data.mensagemFinal,
          tipoConteudo: node.data.tipoConteudo,
          quantidade: node.data.quantidade,
          tipoIntervalo: node.data.tipoIntervalo,
          // Fields specific to different node types
          calculatorFields: node.data.calculatorFields,
          formula: node.data.formula,
          resultLabel: node.data.resultLabel,
          conditions: node.data.conditions,
          nomenclatura: node.data.nomenclatura,
          prefixo: node.data.prefixo,
          sufixo: node.data.sufixo,
          tipoNumero: node.data.tipoNumero,
          operacao: node.data.operacao,
          camposReferenciados: node.data.camposReferenciados,
          condicoesEspeciais: node.data.condicoesEspeciais,
          completed: false,
          response: null,
          order: steps.length + 1,
          availableAt: new Date().toISOString(),
          canGoBack: steps.length > 0
        };
        
        steps.push(step);
      }
      
      // Find next nodes
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      nextEdges.forEach(edge => {
        traverseFlow(edge.target);
      });
    };
    
    traverseFlow(startNode.id);
    return steps;
  };

  const processNodesSequence = async (nodes: FlowNode[], edges: FlowEdge[]): Promise<FlowStep[]> => {
    const steps: FlowStep[] = [];
    let currentStepDate = new Date();
    
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
      if (['formStart', 'formEnd', 'question', 'calculator', 'conditions'].includes(currentNode.type)) {
        const step: FlowStep = {
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          title: currentNode.data.titulo || currentNode.data.label || `${currentNode.type} ${order}`,
          description: currentNode.data.descricao,
          order,
          availableAt: currentStepDate.toISOString(),
          completed: false,
          canGoBack: order > 1
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
        } else if (currentNode.type === 'calculator') {
          step.calculatorFields = currentNode.data.calculatorFields;
          step.formula = currentNode.data.formula;
          step.resultLabel = currentNode.data.resultLabel;
        } else if (currentNode.type === 'conditions') {
          step.conditions = currentNode.data.conditions;
        }

        steps.push(step);
        order++;
      }

      // Process delays
      if (currentNode.type === 'delay') {
        const delayAmount = currentNode.data.quantidade || 1;
        const delayType = currentNode.data.tipoIntervalo || 'dias';
        
        if (steps.length > 0) {
          const lastStep = steps[steps.length - 1];
          lastStep.delayAmount = delayAmount;
          lastStep.delayType = delayType;
        }
        
        let nextStepDate = new Date(currentStepDate);
        switch (delayType) {
          case 'minutos':
            nextStepDate.setMinutes(nextStepDate.getMinutes() + delayAmount);
            break;
          case 'horas':
            nextStepDate.setHours(nextStepDate.getHours() + delayAmount);
            break;
          case 'dias':
          default:
            nextStepDate.setDate(nextStepDate.getDate() + delayAmount);
            break;
        }
        
        currentStepDate = nextStepDate;
      }

      // Find next node
      const nextEdge = edges.find(edge => edge.source === currentNodeId);
      currentNodeId = nextEdge ? nextEdge.target : null;

      if (currentNode.type === 'end') break;
    }

    return steps;
  };

  const completeFlowStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    try {
      console.log('useFlowProcessor: Completando step:', { executionId, stepId, response });
      
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        throw new Error('Execução não encontrada');
      }

      console.log('useFlowProcessor: Execução atual:', execution);

      const currentStepData = execution.current_step as { 
        steps?: any[]; 
        currentStepIndex?: number; 
        calculatorResults?: Record<string, number>;
      } | null;
      const currentSteps = currentStepData?.steps || [];
      
      const stepIndex = currentSteps.findIndex((step: any) => step.nodeId === stepId);
      if (stepIndex === -1) {
        throw new Error('Etapa não encontrada');
      }

      const updatedSteps = [...currentSteps];
      const completedStep = { ...updatedSteps[stepIndex] };
      completedStep.completed = true;
      completedStep.response = response;
      completedStep.completedAt = new Date().toISOString();

      // Store calculator results for use in conditions
      let updatedCalculatorResults = { ...(currentStepData?.calculatorResults || {}) };
      if (response?.nodeType === 'calculator' && response?.result !== undefined) {
        updatedCalculatorResults[stepId] = response.result;
        completedStep.calculatorResult = response.result;
      }

      updatedSteps[stepIndex] = completedStep;

      const completedStepsCount = updatedSteps.filter((step: any) => step.completed).length;
      const newProgress = Math.round((completedStepsCount / updatedSteps.length) * 100);

      // Find next available step
      let nextStepIndex = stepIndex + 1;
      let nextStep = null;
      let nextAvailableAt = null;
      let newStatus = 'completed';

      if (nextStepIndex < updatedSteps.length) {
        nextStep = updatedSteps[nextStepIndex];
        
        // Pass calculator result to conditions step
        if (nextStep.nodeType === 'conditions' && response?.result !== undefined) {
          nextStep.calculatorResult = response.result;
          updatedSteps[nextStepIndex] = nextStep;
        }
        
        if (completedStep.delayAmount && completedStep.delayType) {
          const delayDate = new Date();
          switch (completedStep.delayType) {
            case 'minutos':
              delayDate.setMinutes(delayDate.getMinutes() + completedStep.delayAmount);
              break;
            case 'horas':
              delayDate.setHours(delayDate.getHours() + completedStep.delayAmount);
              break;
            case 'dias':
            default:
              delayDate.setDate(delayDate.getDate() + completedStep.delayAmount);
              break;
          }
          
          nextAvailableAt = delayDate.toISOString();
          updatedSteps[nextStepIndex] = { ...nextStep, availableAt: nextAvailableAt };
          newStatus = 'pending';
        } else {
          newStatus = 'in-progress';
        }
      }

      const updateData: any = {
        completed_steps: completedStepsCount,
        progress: newProgress,
        updated_at: new Date().toISOString(),
        current_step: {
          steps: updatedSteps,
          currentStepIndex: newStatus === 'completed' ? -1 : nextStepIndex,
          totalSteps: updatedSteps.length,
          calculatorResults: updatedCalculatorResults
        }
      };

      if (newStatus === 'completed') {
        updateData.status = newStatus;
        updateData.completed_at = new Date().toISOString();
        updateData.current_node = null;
        updateData.next_step_available_at = null;
      } else {
        updateData.status = newStatus;
        updateData.current_node = nextStep?.nodeId || null;
        updateData.next_step_available_at = nextAvailableAt;
      }

      console.log('useFlowProcessor: Dados para atualização:', updateData);

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (updateError) {
        console.error('Erro na atualização:', updateError);
        throw updateError;
      }

      if (newStatus === 'completed') {
        toast({
          title: "Fluxo concluído!",
          description: "Você completou todos os formulários com sucesso!",
        });
      } else if (newStatus === 'pending' && nextAvailableAt) {
        toast({
          title: "Etapa concluída!",
          description: "Próxima etapa será liberada automaticamente no tempo programado.",
        });
      } else {
        toast({
          title: "Etapa concluída!",
          description: "Continue para a próxima etapa.",
        });
      }

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

  const goBackToStep = useCallback(async (executionId: string, targetStepIndex: number) => {
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
      
      if (targetStepIndex < 0 || targetStepIndex >= currentSteps.length) {
        throw new Error('Índice de etapa inválido');
      }

      const targetStep = currentSteps[targetStepIndex];
      if (!targetStep.completed) {
        throw new Error('Só é possível voltar para etapas já completadas');
      }

      const updateData = {
        status: 'in-progress', // Use valid status
        current_node: targetStep.nodeId,
        current_step: {
          ...currentStepData,
          currentStepIndex: targetStepIndex
        },
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Navegação realizada",
        description: "Você voltou para a etapa selecionada.",
      });

    } catch (error) {
      console.error('Erro ao voltar para etapa:', error);
      toast({
        title: "Erro na navegação",
        description: "Não foi possível voltar para esta etapa",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    processing,
    processFlowAssignment,
    completeFlowStep,
    goBackToStep,
  };
};
