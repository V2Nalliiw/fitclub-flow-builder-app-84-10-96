
import { useState, useEffect, useCallback } from 'react';
import { PatientFlowExecution, PatientFlowStep } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';

export const usePatientFlows = () => {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<PatientFlowExecution[]>([]);
  const [steps, setSteps] = useState<PatientFlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data para demonstração
  const mockExecutions: PatientFlowExecution[] = [
    {
      id: 'exec_1',
      flow_id: 'flow_1',
      flow_name: 'Avaliação Inicial',
      paciente_id: user?.id || '',
      status: 'em-andamento',
      no_atual: 'form_1',
      progresso: 33,
      started_at: '2024-01-15T10:00:00Z',
      current_step: {
        id: 'form_1',
        type: 'formStart',
        title: 'Questionário de Saúde',
        description: 'Preencha suas informações de saúde',
        completed: false,
      },
      total_steps: 3,
      completed_steps: 1,
    },
    {
      id: 'exec_2',
      flow_id: 'flow_2',
      flow_name: 'Acompanhamento Semanal',
      paciente_id: user?.id || '',
      status: 'aguardando',
      no_atual: 'delay_1',
      progresso: 50,
      started_at: '2024-01-20T14:00:00Z',
      next_step_available_at: '2024-01-27T14:00:00Z',
      current_step: {
        id: 'delay_1',
        type: 'delay',
        title: 'Aguardando próxima consulta',
        description: 'Disponível em 2 dias',
        completed: false,
      },
      total_steps: 4,
      completed_steps: 2,
    },
    {
      id: 'exec_3',
      flow_id: 'flow_3',
      flow_name: 'Programa de Exercícios',
      paciente_id: user?.id || '',
      status: 'concluido',
      no_atual: 'end_1',
      progresso: 100,
      started_at: '2024-01-10T08:00:00Z',
      completed_at: '2024-01-25T18:00:00Z',
      current_step: {
        id: 'end_1',
        type: 'end',
        title: 'Programa Concluído',
        description: 'Parabéns! Você completou o programa',
        completed: true,
      },
      total_steps: 5,
      completed_steps: 5,
    },
  ];

  const loadPatientFlows = useCallback(async () => {
    setLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui integraria com Supabase para buscar os fluxos reais
      setExecutions(mockExecutions);
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const completeStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    try {
      // Simular conclusão de etapa
      setExecutions(prev => 
        prev.map(exec => {
          if (exec.id === executionId) {
            const newCompletedSteps = exec.completed_steps + 1;
            const newProgress = Math.round((newCompletedSteps / exec.total_steps) * 100);
            
            return {
              ...exec,
              completed_steps: newCompletedSteps,
              progresso: newProgress,
              status: newProgress >= 100 ? 'concluido' : exec.status,
              current_step: {
                ...exec.current_step,
                completed: true,
              }
            };
          }
          return exec;
        })
      );

      console.log('Etapa concluída:', { executionId, stepId, response });
    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      throw error;
    }
  }, []);

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
