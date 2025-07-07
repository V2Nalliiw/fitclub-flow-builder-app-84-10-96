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
      // Buscar execuções de fluxo do paciente que foram completadas
      const { data: executions, error } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', patientId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar respostas:', error);
        return;
      }

      // Transform executions to responses format
      const transformedResponses: PatientResponse[] = (executions || []).map((execution) => {
        const currentStep = execution.current_step as any;
        return {
          id: execution.id,
          flowName: execution.flow_name || 'Formulário',
          stepTitle: currentStep?.title || 'Formulário Completado',
          response: currentStep?.response || 'Formulário concluído com sucesso',
          completedAt: execution.completed_at!,
          status: execution.status || 'completed'
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