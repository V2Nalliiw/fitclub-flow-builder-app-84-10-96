import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExistingPatient {
  id: string;
  name: string;
  email: string;
  user_id: string;
}

export interface PatientInvitation {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  phone?: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export const useHybridPatientInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<PatientInvitation[]>([]);
  const [existingPatients, setExistingPatients] = useState<ExistingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Buscar pacientes existentes sem clínica
  const searchExistingPatients = useCallback(async (searchTerm: string) => {
    console.log('Iniciando busca por:', searchTerm);
    
    if (!searchTerm || searchTerm.length < 2) {
      setExistingPatients([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Executando query no Supabase...');
      
      // Primeiro, vamos fazer uma busca mais ampla para debug
      const { data: allPatients, error: debugError } = await supabase
        .from('profiles')
        .select('user_id, name, email, role, clinic_id')
        .eq('role', 'patient');

      console.log('Todos os pacientes encontrados:', allPatients);
      console.log('Erro na busca de debug:', debugError);

      // Agora a busca específica
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .is('clinic_id', null)
        .eq('role', 'patient')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      console.log('Resultado da busca específica:', data);
      console.log('Erro na busca específica:', error);

      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast({
          title: "Erro na busca",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const patients: ExistingPatient[] = (data || []).map(profile => ({
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        user_id: profile.user_id,
      }));

      console.log('Pacientes transformados:', patients);
      setExistingPatients(patients);
    } catch (error) {
      console.error('Erro inesperado na busca:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado na busca",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Carregar convites da nova tabela
  const loadInvitations = useCallback(async () => {
    if (!user?.clinic_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_invitations')
        .select('*')
        .eq('clinic_id', user.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar convites:', error);
        toast({
          title: "Erro ao carregar convites",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const transformedInvitations = (data || []).map(invitation => ({
        ...invitation,
        status: invitation.status as 'pending' | 'accepted' | 'expired' | 'cancelled'
      }));

      setInvitations(transformedInvitations);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os convites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.clinic_id, toast]);

  // Convidar paciente existente
  const inviteExistingPatient = async (patient: ExistingPatient) => {
    if (!user?.clinic_id || !user?.id) {
      toast({
        title: "Erro",
        description: "Clínica ou usuário não identificado",
        variant: "destructive",
      });
      return false;
    }

    setIsCreating(true);

    try {
      // Criar notificação para o paciente existente
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: patient.user_id,
          title: `Convite da Clínica`,
          message: `Você foi convidado para se juntar à nossa clínica.`,
          type: 'info',
          category: 'patient_invite',
          metadata: {
            clinic_id: user.clinic_id,
            invited_by: user.id,
            invitation_type: 'existing_patient',
          }
        });

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
        toast({
          title: "Erro ao enviar convite",
          description: notificationError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Convite enviado",
        description: `Convite interno enviado para ${patient.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao convidar paciente existente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Convidar novo paciente (via email)
  const inviteNewPatient = async (invitationData: {
    name: string;
    email: string;
    phone?: string;
    expiresInDays?: number;
  }) => {
    if (!user?.clinic_id || !user?.id) {
      toast({
        title: "Erro",
        description: "Clínica ou usuário não identificado",
        variant: "destructive",
      });
      return false;
    }

    setIsCreating(true);

    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (invitationData.expiresInDays || 7));

    try {
      // Inserir na nova tabela patient_invitations
      const { data, error } = await supabase
        .from('patient_invitations')
        .insert({
          clinic_id: user.clinic_id,
          invited_by: user.id,
          name: invitationData.name,
          email: invitationData.email,
          phone: invitationData.phone,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar convite:', error);
        toast({
          title: "Erro ao criar convite",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Enviar email usando Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-patient-invitation',
          {
            body: {
              name: invitationData.name,
              email: invitationData.email,
              phone: invitationData.phone,
              invitationToken,
              expiresAt: expiresAt.toISOString(),
              clinicName: 'Nossa Clínica',
            },
          }
        );

        if (emailError) {
          console.error('Erro ao enviar email:', emailError);
          toast({
            title: "Convite criado, mas email não foi enviado",
            description: "O convite foi registrado, mas houve um problema ao enviar o email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Convite enviado",
            description: `Convite enviado por email para ${invitationData.name}`,
          });
        }
      } catch (emailError) {
        console.error('Erro ao chamar função de email:', emailError);
        toast({
          title: "Convite criado",
          description: `Convite criado para ${invitationData.name}, mas o email não pôde ser enviado automaticamente`,
        });
      }

      await loadInvitations();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o convite",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Atualizar status do convite
  const updateInvitation = async (invitationId: string, status: 'cancelled' | 'expired') => {
    try {
      const { error } = await supabase
        .from('patient_invitations')
        .update({ status })
        .eq('id', invitationId);

      if (error) {
        console.error('Erro ao atualizar convite:', error);
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Convite atualizado",
        description: "O status do convite foi atualizado",
      });

      await loadInvitations();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o convite",
        variant: "destructive",
      });
      return false;
    }
  };

  // Reenviar convite
  const resendInvitation = async (invitationId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('patient_invitations')
        .update({
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', invitationId);

      if (error) {
        console.error('Erro ao reenviar convite:', error);
        toast({
          title: "Erro ao reenviar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso",
      });

      await loadInvitations();
      return true;
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o convite",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  return {
    invitations,
    existingPatients,
    loading,
    isCreating,
    isSearching,
    searchExistingPatients,
    inviteExistingPatient,
    inviteNewPatient,
    updateInvitation,
    resendInvitation,
    refetch: loadInvitations,
  };
};
