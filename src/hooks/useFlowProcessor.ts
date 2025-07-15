
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FlowNode, FlowEdge } from '@/types/flow';
import { useConditionalFlowProcessor } from './useConditionalFlowProcessor';

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
  tipoExibicao?: 'aberto' | 'select';
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
  nomenclatura?: string;
  prefixo?: string;
  sufixo?: string;
  tipoNumero?: 'inteiro' | 'decimal';
  operacao?: string;
  camposReferenciados?: string[];
  condicoesEspeciais?: any[];
  response?: any;
}

export const useFlowProcessor = () => {
  const { toast } = useToast();
  const { buildConditionalFlowSteps } = useConditionalFlowProcessor();
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

      // Build conditional execution steps - inicialmente sem respostas
      const steps = buildConditionalFlowSteps(nodes, edges, startNode, {}, {});
      console.log('📋 FlowProcessor: Steps condicionais construídos:', steps);

      if (steps.length === 0) {
        throw new Error('Nenhuma etapa válida encontrada no fluxo');
      }

      // Create the flow execution with proper step structure - cast to Json
      const executionData = {
        flow_id: flowId,
        flow_name: flow.name,
        patient_id: patientId,
        status: 'pending',
        current_node: startNode.id,
        progress: 0,
        total_steps: steps.length,
        completed_steps: 0,
        current_step: {
          steps: steps,
          currentStepIndex: 0,
          calculatorResults: {},
          userResponses: {}
        } as any,
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

      console.log('✅ FlowProcessor: Execução criada com steps condicionais:', execution);

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
  }, [toast, buildConditionalFlowSteps]);

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
        userResponses?: Record<string, any>;
      } | null;
      
      const currentSteps = currentStepData?.steps || [];
      const currentResponses = currentStepData?.userResponses || {};
      const currentCalculatorResults = currentStepData?.calculatorResults || {};
      
      const stepIndex = currentSteps.findIndex((step: any) => step.nodeId === stepId);
      if (stepIndex === -1) {
        throw new Error('Etapa não encontrada');
      }

      const updatedSteps = [...currentSteps];
      const completedStep = { ...updatedSteps[stepIndex] };
      completedStep.completed = true;
      completedStep.response = response;
      completedStep.completedAt = new Date().toISOString();

      // Store user responses and calculator results
      let updatedUserResponses = { ...currentResponses };
      let updatedCalculatorResults = { ...currentCalculatorResults };
      
      if (response?.nodeType === 'calculator') {
        // Store calculator result
        if (response?.result !== undefined) {
          updatedCalculatorResults[stepId] = response.result;
          completedStep.calculatorResult = response.result;
        }
        
        // Store calculation responses (numeric inputs) by nomenclatura
        if (response?.calculationResponses) {
          Object.keys(response.calculationResponses).forEach(key => {
            updatedCalculatorResults[key] = response.calculationResponses[key];
          });
        }
        
        // Store question responses from calculator by nomenclatura
        if (response?.questionResponses) {
          Object.keys(response.questionResponses).forEach(key => {
            updatedUserResponses[key] = response.questionResponses[key];
          });
        }
        
        // Store all field responses by nomenclatura for conditions evaluation
        if (response?.fieldResponses) {
          Object.keys(response.fieldResponses).forEach(key => {
            const fieldData = response.fieldResponses[key];
            if (fieldData.fieldType === 'calculo') {
              updatedCalculatorResults[key] = fieldData.value;
            } else if (fieldData.fieldType === 'pergunta') {
              updatedUserResponses[key] = fieldData.value;
            }
          });
        }
      }
      
      if (response?.answer !== undefined) {
        updatedUserResponses[stepId] = response.answer;
      }

      updatedSteps[stepIndex] = completedStep;

      // Recalcular steps baseado nas respostas atuais (para fluxos condicionais)
      if (completedStep.nodeType === 'conditions' || completedStep.nodeType === 'calculator') {
        console.log('🔄 Recalculando fluxo condicional baseado nas respostas...');
        
        // Buscar nodes e edges originais do fluxo
        const { data: flowData } = await supabase
          .from('flows')
          .select('nodes, edges')
          .eq('id', execution.flow_id)
          .single();

        if (flowData) {
          // Type cast the Json data to proper types using unknown first
          const flowNodes = (flowData.nodes as unknown) as FlowNode[];
          const flowEdges = (flowData.edges as unknown) as FlowEdge[];
          
          const startNode = flowNodes.find((node: FlowNode) => node.type === 'start');
          if (startNode) {
            const newSteps = buildConditionalFlowSteps(
              flowNodes, 
              flowEdges, 
              startNode, 
              updatedUserResponses, 
              updatedCalculatorResults
            );
            
            // Manter steps já completados e adicionar novos steps baseados nas condições
            const completedStepsIds = updatedSteps.filter((s: any) => s.completed).map((s: any) => s.nodeId);
            const mergedSteps = newSteps.map((newStep: any) => {
              const existingStep = updatedSteps.find((s: any) => s.nodeId === newStep.nodeId);
              if (existingStep && completedStepsIds.includes(newStep.nodeId)) {
                return existingStep;
              }
              return newStep;
            });
            
            console.log('📋 Steps recalculados:', mergedSteps);
            updatedSteps.splice(0, updatedSteps.length, ...mergedSteps);
          }
        }
      }

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
          calculatorResults: updatedCalculatorResults,
          userResponses: updatedUserResponses
        } as any
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
  }, [toast, buildConditionalFlowSteps]);

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
        status: 'in-progress',
        current_node: targetStep.nodeId,
        current_step: {
          ...currentStepData,
          currentStepIndex: targetStepIndex
        } as any,
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
