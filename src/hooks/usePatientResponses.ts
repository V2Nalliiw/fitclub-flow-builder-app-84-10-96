import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PatientResponse {
  id: string;
  flowName: string;
  stepTitle: string;
  response: string;
  completedAt: string;
  status: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  allSteps?: FormStep[];
  startedAt?: string;
}

export interface FormStep {
  id: string;
  title: string;
  type: string;
  response?: any;
  status: string;
  completedAt?: string;
}

export const usePatientResponses = (patientId?: string) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  const loadPatientResponses = useCallback(async () => {
    if (!patientId || !user) return;

    setLoading(true);
    try {
      // Buscar todas as execuções de fluxo do paciente
      const { data: executions, error } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar respostas:', error);
        return;
      }

      console.log('🔍 Execuções encontradas:', executions);
      console.log('🔍 Primeira execução current_step:', executions?.[0]?.current_step);

      // Transform executions to detailed responses format - Melhorado
      const transformedResponses: PatientResponse[] = (executions || []).map((execution) => {
        const currentStep = execution.current_step as any;
        
        // Extrair todas as perguntas e respostas
        const allSteps: FormStep[] = [];
        
        // Se existe steps no currentStep, extrair de lá
        if (currentStep && currentStep.steps && Array.isArray(currentStep.steps)) {
          console.log('🔍 Processando steps:', currentStep.steps.length);
          
          currentStep.steps.forEach((step: any, stepIndex: number) => {
            console.log(`🔍 Step ${stepIndex}:`, step.nodeType, step.title);
            
            // Extrair de calculatorFields e calculatorQuestionFields
            if (step.calculatorFields && Array.isArray(step.calculatorFields)) {
              step.calculatorFields.forEach((field: any, fieldIndex: number) => {
                if (field.pergunta) {
                  // Buscar resposta correspondente no response
                  let resposta = null;
                  
                  // Verificar diferentes locais onde a resposta pode estar
                  if (step.response?.fieldResponses?.[field.nomenclatura]) {
                    resposta = step.response.fieldResponses[field.nomenclatura].value;
                  } else if (step.response?.calculationResponses?.[field.nomenclatura]) {
                    resposta = step.response.calculationResponses[field.nomenclatura];
                  } else if (step.response?.calculatorResults?.[field.nomenclatura]) {
                    resposta = step.response.calculatorResults[field.nomenclatura];
                  }
                  
                  if (resposta !== null && resposta !== undefined) {
                    allSteps.push({
                      id: `step-${stepIndex}-calc-field-${fieldIndex}`,
                      title: field.pergunta,
                      type: 'calculator_field',
                      response: resposta,
                      status: 'completed',
                      completedAt: step.completedAt || execution.completed_at
                    });
                  }
                }
              });
            }
            
            if (step.calculatorQuestionFields && Array.isArray(step.calculatorQuestionFields)) {
              step.calculatorQuestionFields.forEach((field: any, fieldIndex: number) => {
                if (field.pergunta) {
                  // Buscar resposta correspondente
                  let resposta = null;
                  
                  if (step.response?.fieldResponses?.[field.nomenclatura]) {
                    resposta = step.response.fieldResponses[field.nomenclatura].value;
                  } else if (step.response?.questionResponses?.[field.nomenclatura]) {
                    resposta = step.response.questionResponses[field.nomenclatura];
                  } else if (step.response?.questionResults?.[field.nomenclatura]) {
                    resposta = step.response.questionResults[field.nomenclatura];
                  }
                  
                  if (resposta !== null && resposta !== undefined) {
                    allSteps.push({
                      id: `step-${stepIndex}-question-field-${fieldIndex}`,
                      title: field.pergunta,
                      type: 'question_field',
                      response: resposta,
                      status: 'completed',
                      completedAt: step.completedAt || execution.completed_at
                    });
                  }
                }
              });
            }
            
            // Também extrair resultado da calculadora se existir
            if (step.calculatorResult !== null && step.calculatorResult !== undefined && step.title) {
              allSteps.push({
                id: `step-${stepIndex}-result`,
                title: `Resultado - ${step.title}`,
                type: 'calculator_result',
                response: step.calculatorResult,
                status: 'completed',
                completedAt: step.completedAt || execution.completed_at
              });
            }
          });
        }
        
        // Também verificar userResponses no currentStep para respostas extras
        if (currentStep && currentStep.userResponses) {
          console.log('🔍 Verificando userResponses:', Object.keys(currentStep.userResponses));
          
          Object.entries(currentStep.userResponses).forEach(([key, value]: [string, any]) => {
            // Pular campos que são resultados de condições ou campos especiais
            if (key.includes('_condition_result') || key === 'condition_id' || key === 'condition_index') {
              return;
            }
            
            // Adicionar respostas diretas
            if (typeof value === 'string' || typeof value === 'number') {
              allSteps.push({
                id: `user-response-${key}`,
                title: key.charAt(0).toUpperCase() + key.slice(1).replace(/[_-]/g, ' '),
                type: 'user_response',
                response: value,
                status: 'completed',
                completedAt: execution.completed_at
              });
            }
          });
        }

        console.log(`✅ Total de steps extraídos para ${execution.flow_name}:`, allSteps.length);

        return {
          id: execution.id,
          flowName: execution.flow_name || 'Formulário',
          stepTitle: currentStep?.title || 'Formulário',
          response: currentStep?.response || `${execution.completed_steps || 0} de ${execution.total_steps || 0} etapas concluídas`,
          completedAt: execution.completed_at || execution.created_at!,
          status: execution.status || 'pending',
          progress: execution.progress || 0,
          totalSteps: execution.total_steps || 0,
          completedSteps: execution.completed_steps || 0,
          allSteps: allSteps,
          startedAt: execution.started_at
        };
      });

      setResponses(transformedResponses);
      setResponseCount(transformedResponses.length);
    } catch (error) {
      console.error('Erro inesperado ao carregar respostas:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId, user]);

  useEffect(() => {
    if (patientId) {
      loadPatientResponses();
    }
  }, [patientId, loadPatientResponses]);

  return {
    responses,
    responseCount,
    loading,
    refetch: loadPatientResponses,
  };
};