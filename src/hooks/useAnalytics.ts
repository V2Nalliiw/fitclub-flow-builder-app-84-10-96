
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Json;
  created_at: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['analytics-events', user?.id],
    queryFn: async (): Promise<AnalyticsEvent[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar eventos de analytics:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const trackEventMutation = useMutation({
    mutationFn: async ({ eventType, eventData }: { eventType: string; eventData?: Record<string, any> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar evento:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-events'] });
    },
  });

  const trackEvent = (eventType: string, eventData?: Record<string, any>) => {
    trackEventMutation.mutate({ eventType, eventData });
  };

  // Helper functions for common events
  const trackFlowCreated = (flowId: string, flowName: string) => {
    trackEvent('flow_created', { flowId, flowName });
  };

  const trackFlowAssigned = (flowId: string, patientId: string) => {
    trackEvent('flow_assigned', { flowId, patientId });
  };

  const trackFlowCompleted = (flowId: string, executionId: string) => {
    trackEvent('flow_completed', { flowId, executionId });
  };

  const trackFileUploaded = (fileName: string, fileSize: number) => {
    trackEvent('file_uploaded', { fileName, fileSize });
  };

  return {
    events,
    isLoading,
    trackEvent,
    trackFlowCreated,
    trackFlowAssigned,
    trackFlowCompleted,
    trackFileUploaded,
  };
};
