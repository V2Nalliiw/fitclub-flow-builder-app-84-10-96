
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Configurar escuta para notificações
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload);
          
          const notification = payload.new;
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Mostrar toast baseado no tipo da notificação
          const toastConfig = {
            info: { title: notification.title, description: notification.message },
            success: { title: notification.title, description: notification.message },
            warning: { title: notification.title, description: notification.message },
            error: { title: notification.title, description: notification.message },
          };

          const config = toastConfig[notification.type as keyof typeof toastConfig];
          
          if (notification.type === 'error') {
            toast.error(config.title, { description: config.description });
          } else if (notification.type === 'warning') {
            toast.warning(config.title, { description: config.description });
          } else if (notification.type === 'success') {
            toast.success(config.title, { description: config.description });
          } else {
            toast.info(config.title, { description: config.description });
          }
        }
      )
      .subscribe();

    // Configurar escuta para execuções de fluxo
    const executionsChannel = supabase
      .channel('flow-executions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flow_executions',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Execução de fluxo atualizada:', payload);
          queryClient.invalidateQueries({ queryKey: ['flow-executions'] });
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
          
          const execution = payload.new;
          
          if (execution.status === 'concluido') {
            toast.success('Tratamento Concluído!', {
              description: `O tratamento "${execution.flow_name}" foi finalizado com sucesso.`,
            });
          } else if (execution.status === 'falhou') {
            toast.error('Erro no Tratamento', {
              description: `Ocorreu um erro no tratamento "${execution.flow_name}".`,
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(executionsChannel);
    };
  }, [user, queryClient]);

  return null;
};
