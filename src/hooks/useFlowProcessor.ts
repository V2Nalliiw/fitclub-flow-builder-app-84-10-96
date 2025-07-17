
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FlowNode, FlowEdge } from '@/types/flow';
import { useConditionalFlowProcessor } from './useConditionalFlowProcessor';
import { useImprovedFlowProcessor } from './useImprovedFlowProcessor';
import { useDelayCalculator } from './useDelayCalculator';

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
  const { buildFlowSteps, evaluateConditions } = useImprovedFlowProcessor();
  const { calculateNextStepAvailableAt } = useDelayCalculator();
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

      // Build improved execution steps - inicialmente sem respostas
      const steps = buildFlowSteps(nodes, edges, startNode, {}, {});
      console.log('📋 FlowProcessor: Steps melhorados construídos:', steps);

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
  }, [toast, buildFlowSteps]);

  const completeFlowStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    try {
      console.log('useFlowProcessor: Completando step:', { executionId, stepId, response });
      
      // Buscar patient_id da execução ANTES de qualquer processamento
      const { data: execInfo, error: execInfoError } = await supabase
        .from('flow_executions')
        .select('patient_id, flow_id')
        .eq('id', executionId)
        .single();
      
      if (execInfoError || !execInfo?.patient_id) {
        console.error('❌ Erro ao buscar patient_id:', execInfoError);
        throw new Error('Patient ID não encontrado na execução');
      }
      
      const patientId = execInfo.patient_id;
      console.log('✅ Patient ID capturado:', patientId);
      
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
        // Store calculator result with consistent naming
        if (response?.result !== undefined) {
          updatedCalculatorResults[stepId] = response.result;
          // Store with formula_result key for conditions evaluation
          updatedCalculatorResults['formula_result'] = response.result;
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

      // Find next available step
      let nextStepIndex = stepIndex + 1;
      let nextStep = null;
      let nextAvailableAt = null;
      let newStatus = 'in-progress'; // Default to in-progress, only set to completed when truly done

      if (nextStepIndex < updatedSteps.length) {
        nextStep = updatedSteps[nextStepIndex];
      } else {
        // DON'T mark as completed yet - let the recalculation process handle this
        // for conditional flows, especially after conditions nodes
        nextStep = null;
        console.log('🔄 Aparentemente chegou ao fim, mas aguardando recálculo para fluxos condicionais...');
      }

      // 🎯 CORREÇÃO: Detectar sequência Delay -> FormStart corretamente
      if (nextStep) {
        console.log('📝 FlowProcessor: Analisando próximo step:', { 
          nodeType: nextStep.nodeType, 
          title: nextStep.title,
          hasDelay: !!(nextStep.delayAmount && nextStep.delayType)
        });
        
        // Se o próximo step é delay E há um FormStart depois dele
        if (nextStep.nodeType === 'delay' && (nextStep.delayAmount && nextStep.delayType)) {
          // Verificar se depois do delay há um FormStart
          const afterDelayIndex = nextStepIndex + 1;
          if (afterDelayIndex < updatedSteps.length) {
            const formStartStep = updatedSteps[afterDelayIndex];
            if (formStartStep.nodeType === 'formStart') {
              console.log('🎯 Detectada sequência: FormEnd -> Delay -> FormStart');
              
              // Calcular quando o FormStart deve estar disponível
              nextAvailableAt = calculateNextStepAvailableAt(
                nextStep.delayAmount, 
                nextStep.delayType as 'minutos' | 'horas' | 'dias'
              );
              
              console.log('📅 FormStart será disponível em:', nextAvailableAt);
              
              // Criar delay task para o FormStart
              if (patientId) {
                try {
                  await supabase.from('delay_tasks').insert({
                    execution_id: executionId,
                    patient_id: patientId,
                    next_node_id: formStartStep.nodeId,
                    next_node_type: 'formStart',
                    form_name: formStartStep.title || 'Novo Formulário',
                    trigger_at: nextAvailableAt
                  });
                  console.log('✅ DelayTask criada para sequência Delay -> FormStart');
                } catch (delayTaskError) {
                  console.error('❌ Erro ao criar delay task:', delayTaskError);
                }
              }
              
              // Marcar ambos os steps como tendo delay
              updatedSteps[nextStepIndex] = { ...nextStep, availableAt: nextAvailableAt };
              updatedSteps[afterDelayIndex] = { ...formStartStep, availableAt: nextAvailableAt };
              newStatus = 'pending';
            }
          }
        }
        // Se o próximo step é FormStart direto com delay
        else if (nextStep.nodeType === 'formStart' && (nextStep.delayAmount && nextStep.delayType)) {
          console.log('🎯 FormStart direto com delay detectado');
          
          nextAvailableAt = calculateNextStepAvailableAt(
            nextStep.delayAmount, 
            nextStep.delayType as 'minutos' | 'horas' | 'dias'
          );
          
          console.log('📅 FormStart direto disponível em:', nextAvailableAt);
          
          // Criar delay task
          if (patientId) {
            try {
              await supabase.from('delay_tasks').insert({
                execution_id: executionId,
                patient_id: patientId,
                next_node_id: nextStep.nodeId,
                next_node_type: 'formStart',
                form_name: nextStep.title || 'Novo Formulário',
                trigger_at: nextAvailableAt
              });
              console.log('✅ DelayTask criada para FormStart direto');
            } catch (delayTaskError) {
              console.error('❌ Erro ao criar delay task:', delayTaskError);
            }
          }
          
          updatedSteps[nextStepIndex] = { ...nextStep, availableAt: nextAvailableAt };
          newStatus = 'pending';
        }
      }

      // Recalcular steps baseado nas respostas atuais (para fluxos condicionais)
      if (completedStep.nodeType === 'conditions' || completedStep.nodeType === 'calculator') {
        console.log('🔄 Recalculando fluxo condicional baseado nas respostas...');
        console.log('📊 Respostas atuais para recálculo:', { updatedUserResponses, updatedCalculatorResults });
        console.log('🎯 Condição avaliada:', response?.condition);
        console.log('🎯 ID da condição:', response?.conditionId);
        console.log('🎯 Label da condição:', response?.conditionLabel);
        console.log('🎯 Índice da condição:', response?.conditionIndex);
        
        // Para nós de condições, precisamos atualizar as respostas com a condição escolhida
        if (completedStep.nodeType === 'conditions' && response?.condition) {
          // Armazenar dados da condição avaliada
          updatedUserResponses[`${stepId}_condition_result`] = {
            condition: response.condition,
            conditionIndex: response.conditionIndex,
            conditionLabel: response.conditionLabel,
            conditionId: response.conditionId
          };
          
          // Também armazenar o resultado diretamente para compatibilidade
          updatedUserResponses['resultado'] = response.conditionLabel;
          updatedUserResponses['condition_index'] = response.conditionIndex;
          updatedUserResponses['condition_id'] = response.conditionId;
          
          console.log('🎯 Dados da condição armazenados:', {
            resultado: response.conditionLabel,
            conditionIndex: response.conditionIndex,
            conditionId: response.conditionId
          });
        }
        
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
            const newSteps = buildFlowSteps(
              flowNodes, 
              flowEdges, 
              startNode, 
              updatedUserResponses, 
              updatedCalculatorResults
            );
            
            console.log('🎯 Novos steps calculados:', newSteps.map(s => `${s.nodeType}:${s.title}`));
            
            // Manter steps já completados e adicionar novos steps baseados nas condições
            const completedStepsIds = updatedSteps.filter((s: any) => s.completed).map((s: any) => s.nodeId);
            const mergedSteps = newSteps.map((newStep: any) => {
              const existingStep = updatedSteps.find((s: any) => s.nodeId === newStep.nodeId);
              if (existingStep && completedStepsIds.includes(newStep.nodeId)) {
                // Manter step completado mas atualizar dados se necessário
                return { ...existingStep, ...newStep, completed: true, response: existingStep.response };
              }
              return newStep;
            });
            
            console.log('📋 Steps finais após merge:', mergedSteps.map(s => `${s.nodeType}:${s.title} (${s.completed ? 'DONE' : 'PENDING'})`));
            updatedSteps.splice(0, updatedSteps.length, ...mergedSteps);
            
            // Atualizar nextStepIndex para apontar para o próximo step não completado
            nextStepIndex = mergedSteps.findIndex((s: any) => !s.completed);
            if (nextStepIndex !== -1) {
              nextStep = mergedSteps[nextStepIndex];
              console.log('🎯 Próximo step após recálculo:', nextStep);
              console.log('🔍 Detalhes do próximo step:', {
                nodeType: nextStep.nodeType,
                title: nextStep.title,
                nodeId: nextStep.nodeId,
                completed: nextStep.completed
              });
            } else {
              nextStep = null;
              nextStepIndex = mergedSteps.length;
              
              // Verificar se realmente não há mais steps para processar
              const pendingSteps = mergedSteps.filter((s: any) => !s.completed);
              console.log('🔍 Steps pendentes após recálculo:', pendingSteps.map(s => `${s.nodeType}:${s.title}`));
              
              if (pendingSteps.length === 0) {
                // Só marcar como completed se não há nenhum step pendente
                // Verificar se há steps que podem ser disponibilizados (como FormStart após delay)
                const hasDelayedSteps = mergedSteps.some((s: any) => s.nodeType === 'formStart' && s.availableAt);
                if (hasDelayedSteps) {
                  newStatus = 'pending';
                  console.log('⏸️ Há FormStart com delay - mantendo status pending');
                } else {
                  newStatus = 'completed';
                  console.log('🏁 Todos os steps completados após recálculo - fluxo finalizado');
                }
              } else {
                console.log('⚠️ Ainda há steps pendentes, mas não foram encontrados no índice');
                // Encontrar o primeiro step pendente manualmente
                const firstPendingStep = pendingSteps[0];
                if (firstPendingStep) {
                  nextStepIndex = mergedSteps.findIndex((s: any) => s.nodeId === firstPendingStep.nodeId);
                  nextStep = mergedSteps[nextStepIndex];
                  console.log('🔄 Encontrado step pendente manualmente:', nextStep);
                }
              }
            }
          }
        }
      }

      const completedStepsCount = updatedSteps.filter((step: any) => step.completed).length;
      const newProgress = Math.round((completedStepsCount / updatedSteps.length) * 100);

      // Update next step details if it exists
      if (nextStep) {
        // Pass calculator result to conditions step
        if (nextStep.nodeType === 'conditions' && response?.result !== undefined) {
          nextStep.calculatorResult = response.result;
          updatedSteps[nextStepIndex] = nextStep;
        }
        
        // Se não foi processado pelos casos especiais acima, processar delay genérico
        if (!nextAvailableAt && nextStep.delayAmount && nextStep.delayType) {
          console.log('⏰ Processando delay genérico:', { delayAmount: nextStep.delayAmount, delayType: nextStep.delayType });
          
          nextAvailableAt = calculateNextStepAvailableAt(
            nextStep.delayAmount, 
            nextStep.delayType as 'minutos' | 'horas' | 'dias'
          );
          
          console.log('📅 Próximo step genérico disponível em:', nextAvailableAt);
          updatedSteps[nextStepIndex] = { ...nextStep, availableAt: nextAvailableAt };
          newStatus = 'pending';
        } else if (!nextAvailableAt) {
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
  }, [toast, buildFlowSteps]);

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
