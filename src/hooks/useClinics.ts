
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar clínicas:', error);
        toast({
          title: "Erro ao carregar clínicas",
          description: "Não foi possível carregar a lista de clínicas",
          variant: "destructive",
        });
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
        .insert([clinicData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar clínica:', error);
        toast({
          title: "Erro ao criar clínica",
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
      return data;
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
        .update({
          ...clinicData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clinicId);

      if (error) {
        console.error('Erro ao atualizar clínica:', error);
        toast({
          title: "Erro ao atualizar",
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

  useEffect(() => {
    if (user?.role === 'super_admin') {
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
    getClinicBySlug,
    refetch: loadClinics,
  };
};
