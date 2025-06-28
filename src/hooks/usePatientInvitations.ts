
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
      // Since patient_invitations table doesn't exist in current schema,
      // we'll simulate with notifications table for now
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('category', 'patient_invitation')
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

      // Transform notifications to PatientInvitation format
      const typedInvitations: PatientInvitation[] = (data || []).map((notification: any) => ({
        id: notification.id,
        clinic_id: user.clinic_id || '',
        name: notification.metadata?.name || 'Unknown',
        email: notification.metadata?.email || '',
        phone: notification.metadata?.phone,
        invitation_token: notification.metadata?.token || '',
        status: notification.metadata?.status || 'pending',
        invited_by: notification.user_id || '',
        expires_at: notification.metadata?.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: notification.metadata?.accepted_at,
        created_at: notification.created_at || '',
        updated_at: notification.updated_at || '',
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

    try {
      // Store invitation as notification since patient_invitations table doesn't exist
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `Convite para ${invitationData.name}`,
          message: `Convite enviado para ${invitationData.email}`,
          type: 'invitation',
          category: 'patient_invitation',
          metadata: {
            name: invitationData.name,
            email: invitationData.email,
            phone: invitationData.phone,
            token: invitationToken,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            clinic_id: user.clinic_id,
          }
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
      // Update notification metadata
      const { error } = await supabase
        .from('notifications')
        .update({ 
          metadata: {
            status: updateData.status
          }
        })
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
        .from('notifications')
        .update({
          metadata: {
            expires_at: expiresAt.toISOString(),
            status: 'pending'
          }
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
        .from('notifications')
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
