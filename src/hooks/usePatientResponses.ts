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

      // Transform executions to detailed responses format - Simplificado
      const transformedResponses: PatientResponse[] = (executions || []).map((execution) => {
        const currentStep = execution.current_step as any;
        
        // Extrair todas as perguntas e respostas de forma mais simples
        const allSteps: FormStep[] = [];
        
        const extractQuestionAndAnswer = (obj: any, parentTitle?: string): void => {
          if (!obj || typeof obj !== 'object') return;
          
          // Extrair de campos de calculadora
          if (obj.calculatorFields && Array.isArray(obj.calculatorFields)) {
            obj.calculatorFields.forEach((field: any, index: number) => {
              if (field.pergunta && field.resposta !== undefined) {
                allSteps.push({
                  id: `calc-field-${index}`,
                  title: field.pergunta,
                  type: 'calculator',
                  response: field.resposta,
                  status: 'completed',
                  completedAt: execution.completed_at
                });
              }
            });
          }
          
          // Extrair de campos de perguntas da calculadora
          if (obj.calculatorQuestionFields && Array.isArray(obj.calculatorQuestionFields)) {
            obj.calculatorQuestionFields.forEach((field: any, index: number) => {
              if (field.pergunta && field.opcaoEscolhida !== undefined) {
                allSteps.push({
                  id: `calc-question-${index}`,
                  title: field.pergunta,
                  type: 'question',
                  response: field.opcaoEscolhida,
                  status: 'completed',
                  completedAt: execution.completed_at
                });
              }
            });
          }
          
          // Extrair perguntas diretas
          if (obj.pergunta && obj.resposta !== undefined) {
            allSteps.push({
              id: `direct-question-${allSteps.length}`,
              title: obj.pergunta,
              type: 'question',
              response: obj.resposta,
              status: 'completed',
              completedAt: execution.completed_at
            });
          }
          
          // Extrair de questionários médicos
          if (obj.Pergunta && obj.response !== undefined) {
            const question = obj.Pergunta.pergunta || obj.Pergunta.question || 'Pergunta';
            let answer = obj.response;
            
            // Se há opções de resposta, encontrar o texto da opção escolhida
            if (obj.Pergunta.opcoes_resposta && Array.isArray(obj.Pergunta.opcoes_resposta)) {
              const selectedOption = obj.Pergunta.opcoes_resposta.find((opt: any) => 
                opt.valor === obj.response || opt.value === obj.response
              );
              if (selectedOption) {
                answer = selectedOption.texto || selectedOption.text || obj.response;
              }
            }
            
            allSteps.push({
              id: `medical-question-${allSteps.length}`,
              title: question,
              type: 'medical_question',
              response: answer,
              status: 'completed',
              completedAt: execution.completed_at
            });
          }
          
          // Recursivamente extrair de arrays e objetos aninhados
          Object.values(obj).forEach(value => {
            if (Array.isArray(value)) {
              value.forEach(item => extractQuestionAndAnswer(item));
            } else if (typeof value === 'object') {
              extractQuestionAndAnswer(value);
            }
          });
        };
        
        // Extrair perguntas e respostas do currentStep
        if (currentStep) {
          extractQuestionAndAnswer(currentStep);
        }

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