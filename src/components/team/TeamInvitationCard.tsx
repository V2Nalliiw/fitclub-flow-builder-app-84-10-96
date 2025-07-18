import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, User, Mail, Phone, Calendar, X } from 'lucide-react';
import { TeamInvitation } from '@/hooks/useTeamManagement';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeamInvitationCardProps {
  invitation: TeamInvitation;
  roleLabels: Record<string, string>;
  onCancel: (invitationId: string) => Promise<void>;
}

export const TeamInvitationCard = ({ 
  invitation, 
  roleLabels, 
  onCancel 
}: TeamInvitationCardProps) => {
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'accepted': return 'secondary';
      case 'expired': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'professional': return 'secondary';
      case 'assistant': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const isExpired = new Date(invitation.expires_at) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(invitation.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{invitation.name}</h4>
            <div className="flex items-center space-x-2">
              <Badge variant={getRoleBadgeVariant(invitation.role)} className="text-xs">
                {roleLabels[invitation.role]}
              </Badge>
              <Badge 
                variant={getStatusBadgeVariant(isExpired ? 'expired' : invitation.status)} 
                className="text-xs"
              >
                {isExpired ? 'Expirado' : getStatusLabel(invitation.status)}
              </Badge>
            </div>
          </div>
        </div>
        
        {invitation.status === 'pending' && !isExpired && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onCancel(invitation.id)}
                className="text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Convite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-3 w-3 mr-2" />
            {invitation.email}
          </div>
          
          {invitation.whatsapp_phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              {invitation.whatsapp_phone}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-2" />
            Enviado {formatDistanceToNow(new Date(invitation.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-2" />
            Expira {formatDistanceToNow(new Date(invitation.expires_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>
        
        {invitation.status === 'pending' && !isExpired && (
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Aguardando {invitation.name} aceitar o convite
            </p>
          </div>
        )}
        
        {isExpired && (
          <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-xs text-red-700 dark:text-red-300">
              Este convite expirou. Envie um novo convite se necessário.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};