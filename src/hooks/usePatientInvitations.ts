
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface PatientInvitation {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  phone?: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePatientInvitations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['patient-invitations', user?.clinic_id],
    queryFn: async (): Promise<PatientInvitation[]> => {
      if (!user?.clinic_id) return [];

      const { data, error } = await supabase
        .from('patient_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar convites:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.clinic_id,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: {
      email: string;
      name: string;
      phone?: string;
      expiresInDays?: number;
    }) => {
      if (!user?.clinic_id) throw new Error('Clínica não identificada');

      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (invitationData.expiresInDays || 7));

      const { data, error } = await supabase
        .from('patient_invitations')
        .insert({
          clinic_id: user.clinic_id,
          email: invitationData.email,
          name: invitationData.name,
          phone: invitationData.phone,
          invited_by: user.id,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar convite:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-invitations'] });
      toast.success('Convite enviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao enviar convite: ' + error.message);
    },
  });

  const updateInvitationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PatientInvitation['status'] }) => {
      const updateData: any = { status };
      
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('patient_invitations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar convite:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-invitations'] });
      toast.success('Convite atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar convite:', error);
      toast.error('Erro ao atualizar convite: ' + error.message);
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('patient_invitations')
        .update({
          expires_at: newExpiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao reenviar convite:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-invitations'] });
      toast.success('Convite reenviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao reenviar convite:', error);
      toast.error('Erro ao reenviar convite: ' + error.message);
    },
  });

  return {
    invitations,
    isLoading,
    createInvitation: createInvitationMutation.mutate,
    updateInvitation: updateInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isUpdating: updateInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
  };
};
