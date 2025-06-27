
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityItem {
  id: string;
  type: 'flow_created' | 'execution_started' | 'execution_completed' | 'form_submitted';
  description: string;
  timestamp: string;
  user_name?: string;
  flow_name?: string;
}

export const useRecentActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const activities: ActivityItem[] = [];

      try {
        if (user.role === 'super_admin' || user.role === 'clinic') {
          // Buscar execuções recentes
          const { data: executions } = await supabase
            .from('flow_executions')
            .select('id, status, flow_name, created_at, started_at, completed_at')
            .order('created_at', { ascending: false })
            .limit(10);

          executions?.forEach(execution => {
            if (execution.started_at) {
              activities.push({
                id: `exec-start-${execution.id}`,
                type: 'execution_started',
                description: `Execução do fluxo "${execution.flow_name}" iniciada`,
                timestamp: execution.started_at,
                flow_name: execution.flow_name
              });
            }

            if (execution.completed_at) {
              activities.push({
                id: `exec-complete-${execution.id}`,
                type: 'execution_completed',
                description: `Execução do fluxo "${execution.flow_name}" concluída`,
                timestamp: execution.completed_at,
                flow_name: execution.flow_name
              });
            }
          });

          // Buscar fluxos criados recentemente
          const { data: flows } = await supabase
            .from('flows')
            .select('id, name, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

          flows?.forEach(flow => {
            activities.push({
              id: `flow-${flow.id}`,
              type: 'flow_created',
              description: `Novo fluxo "${flow.name}" criado`,
              timestamp: flow.created_at,
              flow_name: flow.name
            });
          });

        } else if (user.role === 'patient') {
          // Paciente vê apenas suas atividades
          const { data: executions } = await supabase
            .from('flow_executions')
            .select('id, status, flow_name, created_at, started_at, completed_at')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          executions?.forEach(execution => {
            if (execution.started_at) {
              activities.push({
                id: `my-exec-start-${execution.id}`,
                type: 'execution_started',
                description: `Você iniciou o tratamento "${execution.flow_name}"`,
                timestamp: execution.started_at,
                flow_name: execution.flow_name
              });
            }

            if (execution.completed_at) {
              activities.push({
                id: `my-exec-complete-${execution.id}`,
                type: 'execution_completed',
                description: `Você concluiu o tratamento "${execution.flow_name}"`,
                timestamp: execution.completed_at,
                flow_name: execution.flow_name
              });
            }
          });
        }

        // Ordenar por timestamp mais recente
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);

      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
