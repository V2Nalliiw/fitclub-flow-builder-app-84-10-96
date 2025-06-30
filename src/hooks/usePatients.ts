import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp_verified?: boolean;
  clinic_id: string;
  avatar_url?: string;
  role: string;
  is_chief: boolean;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!user?.id || !user?.clinic_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar pacientes da clínica específica com informações do WhatsApp
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .eq('clinic_id', user.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar pacientes:', error);
        toast({
          title: "Erro ao carregar pacientes",
          description: "Não foi possível carregar a lista de pacientes",
          variant: "destructive",
        });
        return;
      }

      // Transform profiles to Patient format with WhatsApp info
      const transformedPatients: Patient[] = (data || []).map((profile: any) => ({
        id: profile.user_id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
        whatsapp_verified: !!profile.phone, // Se tem phone, consideramos verificado por enquanto
        clinic_id: profile.clinic_id,
        avatar_url: profile.avatar_url || undefined,
        role: profile.role,
        is_chief: profile.is_chief || false,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }));

      console.log('Pacientes carregados com WhatsApp:', transformedPatients);
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.clinic_id, toast]);

  const getPatientWhatsApp = useCallback((patientId: string): string | null => {
    const patient = patients.find(p => p.id === patientId || p.user_id === patientId);
    return patient?.phone || null;
  }, [patients]);

  const isPatientWhatsAppVerified = useCallback((patientId: string): boolean => {
    const patient = patients.find(p => p.id === patientId || p.user_id === patientId);
    return patient?.whatsapp_verified || false;
  }, [patients]);

  const addPatient = async (patientData: { name: string; email: string; phone?: string }) => {
    if (!user?.id || !user?.clinic_id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou sem clínica associada",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Primeiro, criar o usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: patientData.email,
        password: Math.random().toString(36).slice(-8), // Senha temporária
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: patientData.name,
            role: 'patient',
            clinic_id: user.clinic_id
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast({
          title: "Erro ao criar usuário",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }

      // Se o usuário foi criado com sucesso, atualizar os dados específicos do paciente
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            clinic_id: user.clinic_id,
            phone: patientData.phone || null,
            role: 'patient'
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          toast({
            title: "Aviso",
            description: "Paciente criado, mas alguns dados podem não ter sido salvos",
            variant: "default",
          });
        }
      }

      toast({
        title: "Paciente adicionado",
        description: "O paciente foi adicionado com sucesso",
      });
      
      await loadPatients();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o paciente",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePatient = async (patientId: string, patientData: { name: string; email: string; phone?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', patientId) // Use user_id instead of id
        .eq('clinic_id', user?.clinic_id); // Garantir que só atualize pacientes da clínica

      if (error) {
        console.error('Erro ao atualizar paciente:', error);
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Paciente atualizado",
        description: "Os dados do paciente foram atualizados com sucesso",
      });
      
      await loadPatients();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o paciente",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', patientId) // Use user_id instead of id
        .eq('clinic_id', user?.clinic_id); // Garantir que só delete pacientes da clínica

      if (error) {
        console.error('Erro ao deletar paciente:', error);
        toast({
          title: "Erro ao deletar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Paciente removido",
        description: "O paciente foi removido com sucesso",
      });
      
      await loadPatients();
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o paciente",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user?.role === 'clinic' && user?.clinic_id) {
      loadPatients();
    } else {
      setLoading(false);
    }
  }, [user, loadPatients]);

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientWhatsApp,
    isPatientWhatsAppVerified,
    refetch: loadPatients,
  };
};
