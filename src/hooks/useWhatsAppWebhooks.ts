
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

      const { data, error } = await supabase
        .from('whatsapp_webhooks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar webhooks:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.clinic_id,
  });

  const processWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const { data, error } = await supabase
        .from('whatsapp_webhooks')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
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
          table: 'whatsapp_webhooks',
          filter: `clinic_id=eq.${user.clinic_id}`,
        },
        (payload) => {
          console.log('Novo webhook recebido:', payload);
          queryClient.invalidateQueries({ queryKey: ['whatsapp-webhooks'] });
          
          toast.success('Nova mensagem WhatsApp recebida!', {
            description: `De: ${payload.new.phone_number}`,
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
