
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WhatsAppWebhook {
  id: string;
  clinic_id: string;
  webhook_id: string;
  phone_number: string;
  message_data: any;
  message_type: string;
  status: string;
  processed_at?: string;
  created_at: string;
}

export const useWhatsAppWebhooks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['whatsapp-webhooks', user?.clinic_id],
    queryFn: async (): Promise<WhatsAppWebhook[]> => {
      if (!user?.clinic_id) return [];

      // Since whatsapp_webhooks table doesn't exist, we'll use notifications table
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('category', 'whatsapp_webhook')
        .eq('metadata->>clinic_id', user.clinic_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar webhooks:', error);
        throw error;
      }

      // Transform notifications to WhatsAppWebhook format
      return (data || []).map((notification: any) => {
        const metadata = notification.metadata || {};
        return {
          id: notification.id,
          clinic_id: user.clinic_id || '',
          webhook_id: metadata.webhook_id || '',
          phone_number: metadata.phone_number || '',
          message_data: metadata.message_data || {},
          message_type: metadata.message_type || 'text',
          status: metadata.status || 'received',
          processed_at: metadata.processed_at,
          created_at: notification.created_at || '',
        };
      });
    },
    enabled: !!user?.clinic_id,
  });

  const processWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      // Update the notification metadata to mark as processed
      const { data, error } = await supabase
        .from('notifications')
        .update({
          metadata: {
            status: 'processed',
            processed_at: new Date().toISOString(),
          }
        })
        .eq('id', webhookId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao processar webhook:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-webhooks'] });
      toast.success('Webhook processado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao processar webhook:', error);
      toast.error('Erro ao processar webhook: ' + error.message);
    },
  });

  // Configurar escuta em tempo real para novos webhooks
  const setupRealtimeSubscription = () => {
    if (!user?.clinic_id) return;

    const channel = supabase
      .channel('whatsapp-webhooks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `category=eq.whatsapp_webhook`,
        },
        (payload) => {
          console.log('Novo webhook recebido:', payload);
          queryClient.invalidateQueries({ queryKey: ['whatsapp-webhooks'] });
          
          const metadata = payload.new.metadata as any;
          toast.success('Nova mensagem WhatsApp recebida!', {
            description: `De: ${metadata?.phone_number || 'Desconhecido'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    webhooks,
    isLoading,
    processWebhook: processWebhookMutation.mutate,
    isProcessing: processWebhookMutation.isPending,
    setupRealtimeSubscription,
  };
};
