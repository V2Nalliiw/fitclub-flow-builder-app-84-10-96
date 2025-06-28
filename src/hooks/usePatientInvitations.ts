
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

export const usePatientInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<PatientInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

      // Garantir que o status seja do tipo correto
      const typedInvitations = (data || []).map(invitation => ({
        ...invitation,
        status: invitation.status as 'pending' | 'accepted' | 'expired' | 'cancelled'
      }));

      setInvitations(typedInvitations);
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

  const createInvitation = async (invitationData: {
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

    // Generate invitation token
    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set expiration based on expiresInDays or default to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (invitationData.expiresInDays || 7));

    const dataToInsert = {
      clinic_id: user.clinic_id,
      name: invitationData.name,
      email: invitationData.email,
      phone: invitationData.phone || null,
      invitation_token: invitationToken,
      status: 'pending' as const,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('patient_invitations')
        .insert(dataToInsert)
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

      toast({
        title: "Convite criado",
        description: `Convite enviado para ${invitationData.name}`,
      });

      // Reload invitations
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

  const updateInvitation = async (updateData: { id: string; status: 'pending' | 'accepted' | 'expired' | 'cancelled' }) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('patient_invitations')
        .update({ status: updateData.status })
        .eq('id', updateData.id);

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
    } finally {
      setIsUpdating(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    setIsResending(true);
    try {
      // Update expires_at to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('patient_invitations')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending'
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
    } finally {
      setIsResending(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Erro ao cancelar convite:', error);
        toast({
          title: "Erro ao cancelar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso",
      });

      await loadInvitations();
      return true;
    } catch (error: any) {
      console.error('Erro ao cancelar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o convite",
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
    loading,
    isLoading: loading, // Alias para compatibilidade
    isCreating,
    isUpdating,
    isResending,
    createInvitation,
    updateInvitation,
    resendInvitation,
    cancelInvitation,
    refetch: loadInvitations,
  };
};
