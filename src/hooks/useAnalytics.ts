
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

interface AnalyticsData {
  totalEvents: number;
  activeUsers: number;
  flowExecutions: number;
  completionRate: number;
  eventsGrowth: number;
  usersGrowth: number;
  executionsGrowth: number;
  completionGrowth: number;
  timelineData: Array<{ date: string; events: number }>;
  eventTypes: Array<{ name: string; value: number }>;
  clinicStats?: Array<{ clinic_name: string; events: number; users: number }>;
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

  // Processar dados para analytics
  const processedData: AnalyticsData = {
    totalEvents: events.length,
    activeUsers: new Set(events.map(e => e.user_id)).size,
    flowExecutions: events.filter(e => e.event_type === 'flow_completed').length,
    completionRate: events.length > 0 ? Math.round((events.filter(e => e.event_type === 'flow_completed').length / events.length) * 100) : 0,
    eventsGrowth: 15, // Mock data
    usersGrowth: 8,   // Mock data
    executionsGrowth: 12, // Mock data
    completionGrowth: 5,  // Mock data
    timelineData: generateTimelineData(events),
    eventTypes: generateEventTypesData(events),
    clinicStats: user?.role === 'super_admin' ? generateClinicStats(events) : undefined,
  };

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
    data: processedData,
    events,
    isLoading,
    trackEvent,
    trackFlowCreated,
    trackFlowAssigned,
    trackFlowCompleted,
    trackFileUploaded,
  };
};

// Helper functions para processar dados
function generateTimelineData(events: AnalyticsEvent[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => ({
    date: date,
    events: events.filter(e => e.created_at?.startsWith(date)).length
  }));
}

function generateEventTypesData(events: AnalyticsEvent[]) {
  const eventTypes = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(eventTypes).map(([name, value]) => ({ name, value }));
}

function generateClinicStats(events: AnalyticsEvent[]) {
  // Mock data para estatísticas de clínica
  return [
    { clinic_name: 'Clínica Saúde Total', events: 45, users: 12 },
    { clinic_name: 'Centro Médico Vida', events: 32, users: 8 },
    { clinic_name: 'Clínica Bem Estar', events: 28, users: 6 },
  ];
}
