
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  FileText,
  Calendar,
  Settings,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAcceptInvite = async (notificationId: string, clinicId: string) => {
    if (!user?.id) return;

    setProcessingInvite(notificationId);
    try {
      console.log('🎯 Aceitando convite:', { notificationId, clinicId, userId: user.id });

      // Atualizar o perfil do usuário com o clinic_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ clinic_id: clinicId })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('💥 Erro ao aceitar convite:', profileError);
        toast({
          title: "Erro ao aceitar convite",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Marcar a notificação como lida
      await markAsRead(notificationId);

      console.log('✅ Convite aceito com sucesso');
      toast({
        title: "Convite aceito",
        description: "Você agora faz parte da clínica!",
      });

      // Recarregar a página para atualizar o contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('💥 Erro inesperado ao aceitar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite",
        variant: "destructive",
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (notificationId: string) => {
    try {
      console.log('❌ Rejeitando convite:', notificationId);
      await markAsRead(notificationId);
      
      toast({
        title: "Convite rejeitado",
        description: "O convite foi rejeitado",
      });
    } catch (error) {
      console.error('💥 Erro ao rejeitar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o convite",
        variant: "destructive",
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient': return <User className="h-3 w-3" />;
      case 'patient_invite': return <UserPlus className="h-3 w-3" />;
      case 'flow': return <FileText className="h-3 w-3" />;
      case 'team': return <Calendar className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'actionable': return notification.actionable || notification.category === 'patient_invite';
      default: return true;
    }
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  const renderNotificationActions = (notification: any) => {
    // Convites de paciente têm ações especiais
    if (notification.category === 'patient_invite' && !notification.read) {
      const clinicId = notification.metadata?.clinic_id;
      const isProcessing = processingInvite === notification.id;
      
      return (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={() => handleAcceptInvite(notification.id, clinicId)}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            Aceitar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRejectInvite(notification.id)}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Rejeitar
          </Button>
        </div>
      );
    }

    // Ações padrão para outras notificações
    return (
      <div className="flex gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => markAsRead(notification.id)}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => deleteNotification(notification.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-1 mt-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Não lidas
          </Button>
          <Button
            variant={filter === 'actionable' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('actionable')}
          >
            Ações
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-6 pb-3">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-0">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div className={cn(
                  "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                  !notification.read && "bg-accent/20",
                  notification.category === 'patient_invite' && !notification.read && "bg-primary/10 border-l-4 border-primary"
                )}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(notification.category)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {notification.category === 'patient_invite' ? 'convite' : notification.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {renderNotificationActions(notification)}
                      </div>
                    </div>
                  </div>
                </div>
                {index < filteredNotifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Nenhuma notificação' : 
               filter === 'unread' ? 'Nenhuma notificação não lida' :
               'Nenhuma notificação requer ação'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
