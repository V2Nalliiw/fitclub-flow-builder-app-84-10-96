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

      // Transform executions to detailed responses format
      const transformedResponses: PatientResponse[] = (executions || []).map((execution) => {
        const currentStep = execution.current_step as any;
        
        // Extrair todas as etapas e respostas de forma mais robusta
        const allSteps: FormStep[] = [];
        
        if (currentStep && typeof currentStep === 'object') {
          // Processar steps aninhados
          if (currentStep.steps && Array.isArray(currentStep.steps)) {
            currentStep.steps.forEach((step: any, index: number) => {
              // Extrair informações do step
              const stepTitle = step.title || step.question || step.label || `Etapa ${index + 1}`;
              const stepType = step.type || step.nodeType || 'response';
              
              // Extrair resposta de diferentes formatos
              let stepResponse = null;
              if (step.response !== undefined) stepResponse = step.response;
              else if (step.value !== undefined) stepResponse = step.value;
              else if (step.answer !== undefined) stepResponse = step.answer;
              else if (step.result !== undefined) stepResponse = step.result;
              else if (step.selected !== undefined) stepResponse = step.selected;
              
              allSteps.push({
                id: step.id || `step-${index}`,
                title: stepTitle,
                type: stepType,
                response: stepResponse,
                status: stepResponse !== null && stepResponse !== undefined ? 'completed' : 'pending',
                completedAt: step.completedAt || step.timestamp || execution.completed_at
              });
            });
          }
          
          // Processar múltiplas estruturas de dados possíveis
          if (currentStep.responses && Array.isArray(currentStep.responses)) {
            currentStep.responses.forEach((resp: any, index: number) => {
              allSteps.push({
                id: resp.id || `response-${index}`,
                title: resp.question || resp.title || `Resposta ${index + 1}`,
                type: resp.type || 'response',
                response: resp.answer || resp.value || resp.response,
                status: 'completed',
                completedAt: resp.timestamp || execution.completed_at
              });
            });
          }
          
          // Processar dados de calculadora
          if (currentStep.calculations && Array.isArray(currentStep.calculations)) {
            currentStep.calculations.forEach((calc: any, index: number) => {
              allSteps.push({
                id: calc.id || `calc-${index}`,
                title: calc.name || `Cálculo ${index + 1}`,
                type: 'calculator',
                response: calc.result || calc.value,
                status: 'completed',
                completedAt: execution.completed_at
              });
            });
          }
          
          // Se não há steps, mas há dados diretos no currentStep
          if (allSteps.length === 0 && (currentStep.title || currentStep.question || currentStep.response)) {
            allSteps.push({
              id: currentStep.id || execution.id,
              title: currentStep.title || currentStep.question || 'Resposta Principal',
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