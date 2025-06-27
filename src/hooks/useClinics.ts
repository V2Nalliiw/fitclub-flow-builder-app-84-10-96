
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

      setClinics(data || []);
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

      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      return null;
    }
  }, []);

  const createClinic = async (clinicData: {
    name: string;
    slug: string;
    description?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
  }) => {
    if (user?.role !== 'super_admin') {
      toast({
        title: "Erro",
        description: "Apenas super administradores podem criar clínicas",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Erro ao criar clínica:', error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Clínica criada",
        description: "A clínica foi criada com sucesso",
      });
      
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
