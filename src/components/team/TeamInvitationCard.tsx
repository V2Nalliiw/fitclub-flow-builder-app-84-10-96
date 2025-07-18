import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Mail, X, Copy } from 'lucide-react';
import { TeamInvitation } from '@/hooks/useTeamManagement';
import { useToast } from '@/hooks/use-toast';

interface TeamInvitationCardProps {
  invitation: TeamInvitation;
  roleLabels: Record<string, string>;
  onCancel: (invitationId: string) => void;
}

export const TeamInvitationCard: React.FC<TeamInvitationCardProps> = ({
  invitation,
  roleLabels,
  onCancel
}) => {
  const { toast } = useToast();

  const handleCancel = () => {
    if (window.confirm(`Tem certeza que deseja cancelar o convite para ${invitation.email}?`)) {
      onCancel(invitation.id);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/team/invite/${invitation.invitation_token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado",
      description: "Link do convite foi copiado para a área de transferência",
    });
  };

  const isExpired = new Date(invitation.expires_at) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-2" style={{ borderColor: 'hsl(var(--border))' }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{invitation.name}</h3>
              <p className="text-sm text-muted-foreground">{invitation.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {roleLabels[invitation.role]}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancel}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {isExpired ? 'Expirado' : 'Pendente'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isExpired ? 'Expirou em:' : 'Expira em:'}
            </span>
            <span className="text-sm">
              {isExpired 
                ? new Date(invitation.expires_at).toLocaleDateString('pt-BR')
                : `${daysUntilExpiry} dias`
              }
            </span>
          </div>

          {invitation.whatsapp_phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">WhatsApp:</span>
              <span className="text-sm">{invitation.whatsapp_phone}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Enviado em:</span>
            <span className="text-sm">
              {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyInviteLink}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link do Convite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};