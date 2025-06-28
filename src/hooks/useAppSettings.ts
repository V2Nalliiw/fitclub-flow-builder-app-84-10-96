
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AppSettings {
  id: string;
  logo_url?: string;
  app_name: string;
  created_at: string;
  updated_at: string;
}

export const useAppSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao carregar configurações do app:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (user?.role !== 'super_admin') {
      toast({
        title: "Erro",
        description: "Apenas super administradores podem alterar as configurações do app",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', settings?.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setSettings(data);
      toast({
        title: "Configurações salvas",
        description: "As configurações do app foram atualizadas com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: loadSettings,
  };
};
