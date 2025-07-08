import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WhatsAppStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  recentActivity: Array<{
    id: string;
    event_type: string;
    created_at: string;
    event_data: any;
  }>;
}

export const WhatsAppStatusCard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<WhatsAppStats>({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        // Buscar estatísticas de WhatsApp das últimas 24h
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);

        const { data: events } = await supabase
          .from('analytics_events')
          .select('*')
          .or('event_type.eq.whatsapp_sent,event_type.eq.whatsapp_failed,event_type.eq.whatsapp_pending')
          .gte('created_at', last24h.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (events) {
          const sent = events.filter(e => e.event_type === 'whatsapp_sent').length;
          const failed = events.filter(e => e.event_type === 'whatsapp_failed').length;
          const pending = events.filter(e => e.event_type === 'whatsapp_pending').length;

          setStats({
            totalSent: sent,
            totalFailed: failed,
            totalPending: pending,
            recentActivity: events.slice(0, 5)
          });
        }
      } catch (error) {
        console.error('Erro ao carregar stats WhatsApp:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'whatsapp_sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'whatsapp_failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'whatsapp_pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'whatsapp_sent':
        return 'Enviado';
      case 'whatsapp_failed':
        return 'Falhou';
      case 'whatsapp_pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">WhatsApp (24h)</CardTitle>
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.totalSent}</div>
            <div className="text-xs text-muted-foreground">Enviados</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.totalFailed}</div>
            <div className="text-xs text-muted-foreground">Falharam</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.totalPending}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
        </div>

        {stats.recentActivity.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Atividade Recente</div>
            {stats.recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getEventIcon(activity.event_type)}
                  <span>{getEventLabel(activity.event_type)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatTime(activity.created_at)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {stats.totalSent === 0 && stats.totalFailed === 0 && stats.totalPending === 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Nenhuma atividade nas últimas 24h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};