
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHybridPatientInvitations } from '@/hooks/useHybridPatientInvitations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Phone, RefreshCw, X, CheckCircle, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const HybridPatientInvitationsList = () => {
  const { 
    invitations, 
    loading, 
    updateInvitation, 
    resendInvitation,
  } = useHybridPatientInvitations();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pending') {
      return <Badge variant="destructive" className="gap-1">
        <Clock className="h-3 w-3" />
        Expirado
      </Badge>;
    }

    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Aceito', variant: 'default' as const, icon: CheckCircle },
      expired: { label: 'Expirado', variant: 'destructive' as const, icon: X },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>;
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-4">
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum convite enviado</p>
            <p className="text-muted-foreground text-center">
              Comece convidando pacientes para sua clínica
            </p>
          </CardContent>
        </Card>
      ) : (
        invitations.map((invitation) => {
          const expired = isExpired(invitation.expires_at);
          const currentStatus = expired && invitation.status === 'pending' ? 'expired' : invitation.status;
          
          return (
            <Card key={invitation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invitation.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {invitation.email}
                      </span>
                      {invitation.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {invitation.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(currentStatus, invitation.expires_at)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Enviado {formatDistanceToNow(new Date(invitation.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                    <p>
                      {expired ? 'Expirou' : 'Expira'} {formatDistanceToNow(new Date(invitation.expires_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                    {invitation.accepted_at && (
                      <p>
                        Aceito {formatDistanceToNow(new Date(invitation.accepted_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {(currentStatus === 'pending' || currentStatus === 'expired') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendInvitation(invitation.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reenviar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvitation(invitation.id, 'cancelled')}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}
                    
                    {currentStatus === 'accepted' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Paciente ativo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
