
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const metrics = {
        totalFlows: 0,
        activeFlows: 0,
        totalExecutions: 0,
        completedExecutions: 0,
        totalUsers: 0,
        totalClinics: 0,
      };

      try {
        // Buscar fluxos baseado no papel do usuário
        if (user.role === 'super_admin') {
          // Super admin vê todos os dados
          const [flowsResult, executionsResult, usersResult] = await Promise.all([
            supabase.from('flows').select('id, is_active'),
            supabase.from('flow_executions').select('id, status'),
            supabase.from('profiles').select('user_id, role')
          ]);

          metrics.totalFlows = flowsResult.data?.length || 0;
          metrics.activeFlows = flowsResult.data?.filter((f: any) => f.is_active).length || 0;
          metrics.totalExecutions = executionsResult.data?.length || 0;
          metrics.completedExecutions = executionsResult.data?.filter((e: any) => e.status === 'completed').length || 0;
          metrics.totalUsers = usersResult.data?.length || 0;
          metrics.totalClinics = usersResult.data?.filter((u: any) => u.role === 'clinic').length || 0;

        } else if (user.role === 'clinic') {
          // Clínica vê apenas seus dados
          const [flowsResult, executionsResult] = await Promise.all([
            supabase.from('flows').select('id, is_active').eq('created_by', user.id),
            supabase
              .from('flow_executions')
              .select('id, status, flow_id')
              .in('flow_id', 
                (await supabase.from('flows').select('id').eq('created_by', user.id)).data?.map((f: any) => f.id) || []
              )
          ]);

          metrics.totalFlows = flowsResult.data?.length || 0;
          metrics.activeFlows = flowsResult.data?.filter((f: any) => f.is_active).length || 0;
          metrics.totalExecutions = executionsResult.data?.length || 0;
          metrics.completedExecutions = executionsResult.data?.filter((e: any) => e.status === 'completed').length || 0;

        } else if (user.role === 'patient') {
          // Paciente vê apenas suas execuções
          const executionsResult = await supabase
            .from('flow_executions')
            .select('id, status')
            .eq('patient_id', user.id);

          metrics.totalExecutions = executionsResult.data?.length || 0;
          metrics.completedExecutions = executionsResult.data?.filter((e: any) => e.status === 'completed').length || 0;
        }
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }

      return metrics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
