
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
        .limit(1000);

      if (error) {
        console.error('Erro ao buscar eventos de analytics:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Buscar dados de clínicas para estatísticas
  const { data: clinicStats = [] } = useQuery({
    queryKey: ['clinic-stats', user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'super_admin') return [];

      const { data: clinics, error } = await supabase
        .from('clinics')
        .select(`
          name,
          profiles!inner(user_id)
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao buscar estatísticas de clínicas:', error);
        return [];
      }

      // Calcular estatísticas por clínica
      return clinics?.map(clinic => {
        const clinicEvents = events.filter(event => 
          clinic.profiles?.some(profile => profile.user_id === event.user_id)
        );
        
        return {
          clinic_name: clinic.name,
          events: clinicEvents.length,
          users: clinic.profiles?.length || 0
        };
      }) || [];
    },
    enabled: !!user && user.role === 'super_admin' && events.length > 0,
  });

  // Processar dados para analytics
  const processedData: AnalyticsData = {
    totalEvents: events.length,
    activeUsers: new Set(events.map(e => e.user_id)).size,
    flowExecutions: events.filter(e => e.event_type === 'flow_completed').length,
    completionRate: events.length > 0 ? Math.round((events.filter(e => e.event_type === 'flow_completed').length / events.length) * 100) : 0,
    eventsGrowth: calculateGrowth(events, 'weekly'),
    usersGrowth: calculateUsersGrowth(events),
    executionsGrowth: calculateExecutionsGrowth(events),
    completionGrowth: calculateCompletionGrowth(events),
    timelineData: generateTimelineData(events),
    eventTypes: generateEventTypesData(events),
    clinicStats: user?.role === 'super_admin' ? clinicStats : undefined,
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

  // Helper functions para eventos comuns
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

  const trackWhatsAppSent = (phoneNumber: string, messageType: string) => {
    trackEvent('whatsapp_sent', { phoneNumber, messageType });
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
    trackWhatsAppSent,
  };
};

// Helper functions para processar dados
function calculateGrowth(events: AnalyticsEvent[], period: 'daily' | 'weekly' | 'monthly' = 'weekly'): number {
  const now = new Date();
  const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 : 
                   period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                   30 * 24 * 60 * 60 * 1000;
  
  const currentPeriodStart = new Date(now.getTime() - periodMs);
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodMs);
  
  const currentPeriodEvents = events.filter(e => 
    new Date(e.created_at) >= currentPeriodStart
  ).length;
  
  const previousPeriodEvents = events.filter(e => {
    const eventDate = new Date(e.created_at);
    return eventDate >= previousPeriodStart && eventDate < currentPeriodStart;
  }).length;
  
  if (previousPeriodEvents === 0) return currentPeriodEvents > 0 ? 100 : 0;
  
  return Math.round(((currentPeriodEvents - previousPeriodEvents) / previousPeriodEvents) * 100);
}

function calculateUsersGrowth(events: AnalyticsEvent[]): number {
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  
  const currentWeekStart = new Date(now.getTime() - weekMs);
  const previousWeekStart = new Date(currentWeekStart.getTime() - weekMs);
  
  const currentWeekUsers = new Set(
    events.filter(e => new Date(e.created_at) >= currentWeekStart)
          .map(e => e.user_id)
  ).size;
  
  const previousWeekUsers = new Set(
    events.filter(e => {
      const eventDate = new Date(e.created_at);
      return eventDate >= previousWeekStart && eventDate < currentWeekStart;
    }).map(e => e.user_id)
  ).size;
  
  if (previousWeekUsers === 0) return currentWeekUsers > 0 ? 100 : 0;
  
  return Math.round(((currentWeekUsers - previousWeekUsers) / previousWeekUsers) * 100);
}

function calculateExecutionsGrowth(events: AnalyticsEvent[]): number {
  const executionEvents = events.filter(e => e.event_type === 'flow_completed');
  return calculateGrowth(executionEvents, 'weekly');
}

function calculateCompletionGrowth(events: AnalyticsEvent[]): number {
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  
  const currentWeekStart = new Date(now.getTime() - weekMs);
  const previousWeekStart = new Date(currentWeekStart.getTime() - weekMs);
  
  const currentWeekEvents = events.filter(e => new Date(e.created_at) >= currentWeekStart);
  const currentWeekCompletions = currentWeekEvents.filter(e => e.event_type === 'flow_completed');
  const currentRate = currentWeekEvents.length > 0 ? (currentWeekCompletions.length / currentWeekEvents.length) * 100 : 0;
  
  const previousWeekEvents = events.filter(e => {
    const eventDate = new Date(e.created_at);
    return eventDate >= previousWeekStart && eventDate < currentWeekStart;
  });
  const previousWeekCompletions = previousWeekEvents.filter(e => e.event_type === 'flow_completed');
  const previousRate = previousWeekEvents.length > 0 ? (previousWeekCompletions.length / previousWeekEvents.length) * 100 : 0;
  
  if (previousRate === 0) return currentRate > 0 ? 100 : 0;
  
  return Math.round(((currentRate - previousRate) / previousRate) * 100);
}

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
