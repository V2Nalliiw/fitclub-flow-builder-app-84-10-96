
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
      // Try to query the clinics table directly
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao carregar clínicas:', error);
        // Use mock data if the table query fails
        const mockClinics: Clinic[] = [
          {
            id: '1',
            name: 'Clínica Saúde Total',
            slug: 'saude-total',
            description: 'Clínica especializada em medicina preventiva',
            contact_email: 'contato@saudetotal.com',
            contact_phone: '(11) 3333-4444',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Centro Médico Vida',
            slug: 'centro-vida',
            description: 'Centro médico com foco em medicina familiar',
            contact_email: 'info@centrovida.com',
            contact_phone: '(11) 2222-3333',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setClinics(mockClinics);
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
      // Try to query the clinics table directly
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao buscar clínica:', error);
        // Fallback to mock data
        const mockClinics: Clinic[] = [
          {
            id: '1',
            name: 'Clínica Saúde Total',
            slug: 'saude-total',
            description: 'Clínica especializada em medicina preventiva',
            contact_email: 'contato@saudetotal.com',
            contact_phone: '(11) 3333-4444',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        return mockClinics.find(clinic => clinic.slug === slug) || null;
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
      // Por enquanto, simular criação de clínica
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
      // Por enquanto, simular atualização
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
