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
    if (!patientId || !user?.clinic_id) return;

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

      // Transform executions to detailed responses format
      const transformedResponses: PatientResponse[] = (executions || []).map((execution) => {
        const currentStep = execution.current_step as any;
        
        // Extrair todas as etapas e respostas se disponível no current_step
        const allSteps: FormStep[] = [];
        
        if (currentStep && typeof currentStep === 'object') {
          // Se current_step contém um array de steps
          if (currentStep.steps && Array.isArray(currentStep.steps)) {
            currentStep.steps.forEach((step: any, index: number) => {
              allSteps.push({
                id: step.id || `step-${index}`,
                title: step.title || step.question || `Etapa ${index + 1}`,
                type: step.type || 'response',
                response: step.response || step.value || step.answer,
                status: step.response ? 'completed' : 'pending',
                completedAt: step.completedAt || execution.completed_at
              });
            });
          } else if (currentStep.title || currentStep.question) {
            // Etapa única
            allSteps.push({
              id: currentStep.id || execution.id,
              title: currentStep.title || currentStep.question || 'Resposta',
              type: currentStep.type || 'response',
              response: currentStep.response || currentStep.value || currentStep.answer,
              status: currentStep.response ? 'completed' : 'pending',
              completedAt: execution.completed_at
            });
          }
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
  }, [patientId, user?.clinic_id]);

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