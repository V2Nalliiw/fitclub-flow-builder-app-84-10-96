
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, GitBranch, Play, CheckCircle, FileText } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'flow_created':
      return GitBranch;
    case 'execution_started':
      return Play;
    case 'execution_completed':
      return CheckCircle;
    case 'form_submitted':
      return FileText;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'flow_created':
      return 'text-primary';
    case 'execution_started':
      return 'text-muted-foreground';
    case 'execution_completed':
      return 'text-primary';
    case 'form_submitted':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'flow_created':
      return 'default';
    case 'execution_started':
      return 'secondary';
    case 'execution_completed':
      return 'default';
    case 'form_submitted':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const ActivityFeed = () => {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start space-x-4">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${color.replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
