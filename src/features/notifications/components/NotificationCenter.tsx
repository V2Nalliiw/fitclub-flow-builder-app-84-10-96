
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  category: 'system' | 'patient' | 'flow' | 'team';
  metadata?: {
    patientId?: string;
    flowId?: string;
    userId?: string;
  };
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Novo paciente cadastrado',
    message: 'Maria Silva foi adicionada à sua clínica',
    timestamp: '2024-01-20T10:30:00Z',
    read: false,
    actionable: true,
    category: 'patient',
    metadata: { patientId: 'patient-1' }
  },
  {
    id: '2',
    type: 'success',
    title: 'Fluxo concluído',
    message: 'João Santos completou o fluxo de reabilitação',
    timestamp: '2024-01-20T09:15:00Z',
    read: false,
    actionable: false,
    category: 'flow',
    metadata: { flowId: 'flow-1', patientId: 'patient-2' }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Formulário pendente',
    message: 'Ana Costa não respondeu ao questionário há 3 dias',
    timestamp: '2024-01-19T16:45:00Z',
    read: true,
    actionable: true,
    category: 'patient',
    metadata: { patientId: 'patient-3' }
  },
  {
    id: '4',
    type: 'error',
    title: 'Erro no sistema',
    message: 'Falha ao enviar WhatsApp para 2 pacientes',
    timestamp: '2024-01-19T14:20:00Z',
    read: false,
    actionable: true,
    category: 'system'
  }
];

interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient': return <User className="h-3 w-3" />;
      case 'flow': return <FileText className="h-3 w-3" />;
      case 'team': return <Calendar className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification =>
        ({ ...notification, read: true })
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'actionable': return notification.actionable;
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
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="w-full">
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
                  !notification.read && "bg-accent/20"
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
                            {notification.category}
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
