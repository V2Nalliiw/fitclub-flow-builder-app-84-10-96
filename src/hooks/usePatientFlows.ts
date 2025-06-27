
import { useState, useEffect, useCallback } from 'react';
import { PatientFlowExecution, PatientFlowStep } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePatientFlows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<PatientFlowExecution[]>([]);
  const [steps, setSteps] = useState<PatientFlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatientFlows = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar execuções do paciente
      const { data: flowExecutions, error: flowError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (flowError) {
        console.error('Erro ao carregar execuções:', flowError);
        toast({
          title: "Erro ao carregar fluxos",
          description: "Não foi possível carregar seus fluxos",
          variant: "destructive",
        });
        return;
      }

      // Transformar dados do Supabase para o formato esperado
      const transformedExecutions: PatientFlowExecution[] = (flowExecutions || []).map(execution => ({
        id: execution.id,
        flow_id: execution.flow_id,
        flow_name: execution.flow_name,
        paciente_id: execution.patient_id,
        status: execution.status as 'em-andamento' | 'pausado' | 'concluido' | 'aguardando',
        no_atual: execution.current_node,
        progresso: execution.progress,
        started_at: execution.started_at,
        completed_at: execution.completed_at || undefined,
        next_step_available_at: execution.next_step_available_at || undefined,
        current_step: execution.current_step as any,
        total_steps: execution.total_steps,
        completed_steps: execution.completed_steps,
      }));

      setExecutions(transformedExecutions);

      // Buscar etapas se houver execuções
      if (transformedExecutions.length > 0) {
        const executionIds = transformedExecutions.map(exec => exec.id);
        const { data: flowSteps, error: stepsError } = await supabase
          .from('flow_steps')
          .select('*')
          .in('execution_id', executionIds)
          .order('created_at', { ascending: true });

        if (stepsError) {
          console.error('Erro ao carregar etapas:', stepsError);
        } else {
          const transformedSteps: PatientFlowStep[] = (flowSteps || []).map(step => ({
            id: step.id,
            execution_id: step.execution_id,
            node_id: step.node_id,
            node_type: step.node_type,
            title: step.title,
            description: step.description || undefined,
            status: step.status as 'pendente' | 'disponivel' | 'concluido' | 'aguardando',
            completed_at: step.completed_at || undefined,
            available_at: step.available_at || undefined,
            form_url: step.form_url || undefined,
            response: step.response || undefined,
          }));
          setSteps(transformedSteps);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const completeStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    if (!user?.id) return;

    try {
      // Buscar a execução atual
      const { data: execution, error: fetchError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (fetchError || !execution) {
        throw new Error('Execução não encontrada');
      }

      // Calcular novo progresso
      const newCompletedSteps = execution.completed_steps + 1;
      const newProgress = Math.round((newCompletedSteps / execution.total_steps) * 100);
      const newStatus = newProgress >= 100 ? 'concluido' : execution.status;

      // Atualizar execução
      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          completed_steps: newCompletedSteps,
          progress: newProgress,
          status: newStatus,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      // Salvar resposta se fornecida
      if (response && stepId) {
        const { error: responseError } = await supabase
          .from('form_responses')
          .insert({
            execution_id: executionId,
            node_id: stepId,
            patient_id: user.id,
            response: response,
          });

        if (responseError) {
          console.error('Erro ao salvar resposta:', responseError);
        }
      }

      // Recarregar dados
      await loadPatientFlows();

      toast({
        title: "Etapa concluída",
        description: "Sua resposta foi registrada com sucesso",
      });

    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast({
        title: "Erro ao completar etapa",
        description: "Não foi possível registrar sua resposta",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, loadPatientFlows, toast]);

  const getTimeUntilAvailable = useCallback((availableAt: string) => {
    const now = new Date();
    const available = new Date(availableAt);
    const diff = available.getTime() - now.getTime();
    
    if (diff <= 0) return 'Disponível agora';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Disponível em ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Disponível em ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Disponível em breve';
  }, []);

  useEffect(() => {
    if (user?.role === 'patient') {
      loadPatientFlows();
    } else {
      setLoading(false);
    }
  }, [user, loadPatientFlows]);

  return {
    executions,
    steps,
    loading,
    completeStep,
    getTimeUntilAvailable,
    refetch: loadPatientFlows,
  };
};
