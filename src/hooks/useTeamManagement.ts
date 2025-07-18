import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'professional' | 'assistant' | 'viewer';
  permissions: any; // JSONB do banco
  whatsapp_phone?: string;
  whatsapp_verified: boolean;
  is_active: boolean;
  invited_by?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  // Dados do usuário via profiles
  user_profile?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamInvitation {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'professional' | 'assistant' | 'viewer';
  permissions: any; // JSONB do banco
  whatsapp_phone?: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'professional' | 'assistant' | 'viewer';
  permissions?: Record<string, boolean>;
  whatsapp_phone?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'professional' | 'assistant' | 'viewer';
  permissions?: Record<string, boolean>;
  whatsapp_phone?: string;
  temporaryPassword: string;
}

const ROLE_LABELS = {
  admin: 'Administrador',
  manager: 'Gerente',
  professional: 'Profissional',
  assistant: 'Assistente',
  viewer: 'Visualizador'
};

const PERMISSION_LABELS = {
  flows_manage: 'Gerenciar Fluxos',
  patients_manage: 'Gerenciar Pacientes',
  whatsapp_manage: 'Gerenciar WhatsApp',
  documents_manage: 'Gerenciar Documentos',
  analytics_view: 'Ver Analytics',
  team_manage: 'Gerenciar Equipe'
};

export const useTeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeamData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carregar membros da equipe
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (membersError) {
        console.error('Erro ao carregar membros:', membersError);
        // Se não for um erro crítico, apenas continua sem membros
        if (membersError.code !== 'PGRST116') { // Not found
          throw membersError;
        }
      }

      // Se há membros, carregar os dados dos perfis
      let transformedMembers: TeamMember[] = [];
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(member => member.user_id);
        
        // Carregar perfis dos usuários
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name, email, avatar_url')
          .in('user_id', userIds);

        // Combinar dados dos membros com perfis
        transformedMembers = membersData.map((member: any) => {
          const profile = profilesData?.find(p => p.user_id === member.user_id);
          return {
            ...member,
            user_profile: profile ? {
              name: profile.name,
              email: profile.email,
              avatar_url: profile.avatar_url
            } : undefined
          };
        });
      }

      // Carregar convites pendentes
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.error('Erro ao carregar convites:', invitationsError);
        // Se não for um erro crítico, apenas continua sem convites
        if (invitationsError.code !== 'PGRST116') { // Not found
          throw invitationsError;
        }
      }

      setMembers(transformedMembers);
      setInvitations((invitationsData || []) as TeamInvitation[]);

    } catch (error) {
      console.error('Erro ao carregar dados da equipe:', error);
      // Não mostra toast de erro se for só ausência de dados
      setMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const createUser = useCallback(async (data: CreateUserData) => {
    if (!user?.id) return;

    try {
      console.log('Criando usuário diretamente:', data);

      const { data: result, error } = await supabase.functions.invoke('create-team-user', {
        body: data
      });

      if (error) {
        throw error;
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao criar usuário');
      }

      toast({
        title: "Usuário criado",
        description: `Usuário ${data.name} foi criado com sucesso`,
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível criar o usuário",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, toast, loadTeamData]);

  const createInvitation = useCallback(async (data: CreateInvitationData) => {
    if (!user?.id) return;

    try {
      // Gerar token único para o convite
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      // Obter clinic_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData?.clinic_id) {
        throw new Error('Não foi possível obter dados da clínica');
      }

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          clinic_id: profileData.clinic_id,
          email: data.email,
          name: data.name,
          role: data.role,
          permissions: data.permissions || {},
          whatsapp_phone: data.whatsapp_phone,
          invited_by: user.id,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${data.email}`,
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Não foi possível enviar o convite",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, toast, loadTeamData]);

  const updateMemberRole = useCallback(async (memberId: string, role: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      toast({
        title: "Cargo atualizado",
        description: "Cargo do membro foi atualizado com sucesso",
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      toast({
        title: "Erro ao atualizar cargo",
        description: error.message || "Não foi possível atualizar o cargo",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadTeamData]);

  const updateMemberPermissions = useCallback(async (memberId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ permissions, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      toast({
        title: "Permissões atualizadas",
        description: "Permissões do membro foram atualizadas com sucesso",
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: "Erro ao atualizar permissões",
        description: error.message || "Não foi possível atualizar as permissões",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadTeamData]);

  const deactivateMember = useCallback(async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      toast({
        title: "Membro removido",
        description: "Membro foi removido da equipe com sucesso",
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro ao remover membro",
        description: error.message || "Não foi possível remover o membro",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadTeamData]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) {
        throw error;
      }

      toast({
        title: "Convite cancelado",
        description: "Convite foi cancelado com sucesso",
      });

      // Recarregar dados
      await loadTeamData();

    } catch (error: any) {
      console.error('Erro ao cancelar convite:', error);
      toast({
        title: "Erro ao cancelar convite",
        description: error.message || "Não foi possível cancelar o convite",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadTeamData]);

  useEffect(() => {
    if (user?.role === 'clinic') {
      loadTeamData();

      // Configurar realtime para atualizações
      const channel = supabase
        .channel('team_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_members'
          },
          () => {
            loadTeamData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_invitations'
          },
          () => {
            loadTeamData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user, loadTeamData]);

  return {
    members,
    invitations,
    loading,
    createInvitation,
    createUser,
    updateMemberRole,
    updateMemberPermissions,
    deactivateMember,
    cancelInvitation,
    refetch: loadTeamData,
    ROLE_LABELS,
    PERMISSION_LABELS
  };
};