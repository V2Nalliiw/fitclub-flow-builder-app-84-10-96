
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, X, Bell } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface InternalInvite {
  id: string;
  title: string;
  message: string;
  created_at: string;
  metadata: {
    clinic_id: string;
    invited_by: string;
    invitation_type: string;
  };
}

export const InternalInviteNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<InternalInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const loadInternalInvites = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'patient_invite')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar convites internos:', error);
        return;
      }

      setInvites(data || []);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteId: string, clinicId: string) => {
    if (!user?.id) return;

    setAccepting(inviteId);
    try {
      // Atualizar o perfil do usuário com o clinic_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ clinic_id: clinicId })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao aceitar convite:', profileError);
        toast({
          title: "Erro ao aceitar convite",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Marcar a notificação como lida
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', inviteId);

      if (notificationError) {
        console.error('Erro ao marcar notificação:', notificationError);
      }

      toast({
        title: "Convite aceito",
        description: "Você agora faz parte da clínica!",
      });

      // Recarregar a página para atualizar o contexto
      window.location.reload();
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', inviteId);

      if (error) {
        console.error('Erro ao rejeitar convite:', error);
        toast({
          title: "Erro ao rejeitar convite",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Convite rejeitado",
        description: "O convite foi rejeitado",
      });

      await loadInternalInvites();
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o convite",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInternalInvites();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Nenhum convite pendente</p>
        <p className="text-muted-foreground text-center">
          Você não possui convites de clínicas no momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{invite.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {invite.message}
                </p>
              </div>
              <Badge variant="secondary">Novo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>
                  Recebido {formatDistanceToNow(new Date(invite.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => acceptInvite(invite.id, invite.metadata.clinic_id)}
                  disabled={!!accepting}
                >
                  {accepting === invite.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Aceitar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectInvite(invite.id)}
                  disabled={!!accepting}
                >
                  <X className="h-3 w-3 mr-1" />
                  Rejeitar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
