import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ResponsibleUser {
  name: string;
  email: string;
  password: string;
  isChief: boolean;
}

interface CreateClinicData {
  name: string;
  slug: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  responsibleUser?: ResponsibleUser;
}

export const useClinics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao carregar clínicas:', error);
        toast({
          title: "Erro ao carregar clínicas",
          description: error.message,
          variant: "destructive",
        });
        setClinics([]);
        return;
      }

      setClinics((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        logo_url: item.logo_url,
        contact_email: item.contact_email,
        contact_phone: item.contact_phone,
        address: item.address,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })));
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados",
        variant: "destructive",
      });
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getClinicBySlug = useCallback(async (slug: string): Promise<Clinic | null> => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao buscar clínica:', error);
        return null;
      }

      return data ? {
        id: (data as any).id,
        name: (data as any).name,
        slug: (data as any).slug,
        description: (data as any).description,
        logo_url: (data as any).logo_url,
        contact_email: (data as any).contact_email,
        contact_phone: (data as any).contact_phone,
        address: (data as any).address,
        is_active: (data as any).is_active,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
      } : null;
    } catch (error) {
      console.error('Erro inesperado:', error);
      return null;
    }
  }, []);

  const createClinic = async (clinicData: CreateClinicData) => {
    if (user?.role !== 'super_admin') {
      toast({
        title: "Erro",
        description: "Apenas super administradores podem criar clínicas",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Iniciando criação da clínica:', clinicData.name);
      
      // 1. Primeiro, criar a clínica
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert([{
          name: clinicData.name,
          slug: clinicData.slug,
          description: clinicData.description,
          contact_email: clinicData.contact_email,
          contact_phone: clinicData.contact_phone,
          address: clinicData.address,
          is_active: true,
        }])
        .select()
        .single();

      if (clinicError) {
        console.error('Erro ao criar clínica:', clinicError);
        toast({
          title: "Erro",
          description: `Erro ao criar clínica: ${clinicError.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Clínica criada com sucesso:', clinic.id);

      // 2. Se há dados do usuário responsável, criar o usuário
      if (clinicData.responsibleUser) {
        const { responsibleUser } = clinicData;
        console.log('Criando usuário responsável:', responsibleUser.email);
        
        try {
          // Criar o usuário usando signup
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: responsibleUser.email,
            password: responsibleUser.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                name: responsibleUser.name,
                role: 'clinic',
                clinic_id: clinic.id
              }
            }
          });

          if (authError) {
            console.error('Erro ao criar usuário:', authError);
            // Se falhar na criação do usuário, excluir a clínica criada
            await supabase.from('clinics').delete().eq('id', clinic.id);
            
            toast({
              title: "Erro",
              description: `Erro ao criar usuário: ${authError.message}`,
              variant: "destructive",
            });
            return false;
          }

          if (!authData.user) {
            console.error('Usuário não foi criado corretamente');
            await supabase.from('clinics').delete().eq('id', clinic.id);
            
            toast({
              title: "Erro",
              description: "Erro ao criar usuário: dados não retornados",
              variant: "destructive",
            });
            return false;
          }

          console.log('Usuário criado com sucesso:', authData.user.id);

          // Aguardar um momento para o trigger criar o perfil básico
          await new Promise(resolve => setTimeout(resolve, 500));

          // Atualizar o perfil com os dados específicos da clínica
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              name: responsibleUser.name,
              role: 'clinic',
              clinic_id: clinic.id,
              is_chief: responsibleUser.isChief,
            })
            .eq('user_id', authData.user.id);

          if (profileError) {
            console.error('Erro ao atualizar perfil:', profileError);
            // Se falhar na atualização do perfil, tentar limpar o que foi criado
            await supabase.from('clinics').delete().eq('id', clinic.id);
            
            toast({
              title: "Erro",
              description: `Erro ao configurar perfil: ${profileError.message}`,
              variant: "destructive",
            });
            return false;
          }

          console.log('Perfil atualizado com sucesso');

          toast({
            title: "Clínica e usuário criados",
            description: `A clínica "${clinicData.name}" e o usuário responsável foram criados com sucesso.`,
          });
        } catch (signupError) {
          console.error('Erro no processo de criação do usuário:', signupError);
          await supabase.from('clinics').delete().eq('id', clinic.id);
          
          toast({
            title: "Erro",
            description: "Erro ao criar usuário responsável",
            variant: "destructive",
          });
          return false;
        }
      } else {
        toast({
          title: "Clínica criada",
          description: "A clínica foi criada com sucesso",
        });
      }
      
      await loadClinics();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar clínica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a clínica",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateClinic = async (clinicId: string, clinicData: Partial<Clinic>) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update(clinicData)
        .eq('id', clinicId);

      if (error) {
        console.error('Erro ao atualizar clínica:', error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Clínica atualizada",
        description: "Os dados da clínica foram atualizados com sucesso",
      });
      
      await loadClinics();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar clínica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a clínica",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteClinic = async (clinicId: string) => {
    if (user?.role !== 'super_admin') {
      toast({
        title: "Erro",
        description: "Apenas super administradores podem excluir clínicas",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: false })
        .eq('id', clinicId);

      if (error) {
        console.error('Erro ao excluir clínica:', error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Clínica excluída",
        description: "A clínica foi excluída com sucesso",
      });
      
      await loadClinics();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir clínica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a clínica",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadClinics();
    } else {
      setLoading(false);
    }
  }, [user, loadClinics]);

  return {
    clinics,
    loading,
    createClinic,
    updateClinic,
    deleteClinic,
    getClinicBySlug,
    refetch: loadClinics,
  };
};
