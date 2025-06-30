
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  category: 'system' | 'patient' | 'flow' | 'team' | 'patient_invite';
  metadata?: {
    patientId?: string;
    flowId?: string;
    userId?: string;
    clinic_id?: string;
    invited_by?: string;
    invitation_type?: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];

      console.log('🔍 Buscando notificações para usuário:', user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('💥 Erro ao buscar notificações:', error);
        throw error;
      }

      console.log('✅ Notificações encontradas:', data?.length || 0);

      return (data || []).map(notification => ({
        id: notification.id,
        type: notification.type as 'info' | 'success' | 'warning' | 'error',
        title: notification.title,
        message: notification.message,
        timestamp: notification.created_at,
        read: notification.read,
        actionable: notification.actionable || notification.category === 'patient_invite',
        category: notification.category as 'system' | 'patient' | 'flow' | 'team' | 'patient_invite',
        metadata: notification.metadata as any,
      }));
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch a cada 30 segundos para atualizações em tempo real
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📖 Marcando notificação como lida:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('💥 Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('📖 Marcando todas as notificações como lidas para:', user.id);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('💥 Erro ao marcar todas notificações como lidas:', error);
      toast.error('Erro ao marcar todas notificações como lidas');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🗑️ Deletando notificação:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('💥 Erro ao deletar notificação:', error);
      toast.error('Erro ao deletar notificação');
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: {
      type: 'info' | 'success' | 'warning' | 'error';
      category: 'system' | 'patient' | 'flow' | 'team' | 'patient_invite';
      title: string;
      message: string;
      actionable?: boolean;
      metadata?: Record<string, any>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📝 Criando nova notificação:', notification);

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: notification.type,
          category: notification.category,
          title: notification.title,
          message: notification.message,
          actionable: notification.actionable || notification.category === 'patient_invite',
          metadata: notification.metadata || {},
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('💥 Erro ao criar notificação:', error);
      toast.error('Erro ao criar notificação');
    },
  });

  return {
    notifications,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    createNotification: createNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
    isCreatingNotification: createNotificationMutation.isPending,
  };
};
