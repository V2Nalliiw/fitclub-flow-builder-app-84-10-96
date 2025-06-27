
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppConfig } from '@/services/whatsapp/types';

export interface WhatsAppSettings {
  id: string;
  clinic_id: string;
  provider: 'evolution' | 'meta' | 'twilio';
  base_url?: string;
  api_key?: string;
  session_name?: string;
  account_sid?: string;
  auth_token?: string;
  phone_number?: string;
  access_token?: string;
  business_account_id?: string;
  webhook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWhatsAppSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user?.clinic_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('clinic_id', user.clinic_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar configurações do WhatsApp:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setSettings(data as WhatsAppSettings);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.clinic_id, toast]);

  const saveSettings = async (settingsData: Partial<WhatsAppSettings>) => {
    if (!user?.clinic_id) {
      toast({
        title: "Erro",
        description: "Clínica não identificada",
        variant: "destructive",
      });
      return false;
    }

    // Ensure provider is always set - default to 'evolution' if not provided
    const dataToSave = {
      clinic_id: user.clinic_id,
      provider: settingsData.provider || 'evolution' as const,
      base_url: settingsData.base_url || null,
      api_key: settingsData.api_key || null,
      session_name: settingsData.session_name || null,
      account_sid: settingsData.account_sid || null,
      auth_token: settingsData.auth_token || null,
      phone_number: settingsData.phone_number || null,
      access_token: settingsData.access_token || null,
      business_account_id: settingsData.business_account_id || null,
      webhook_url: settingsData.webhook_url || null,
      is_active: settingsData.is_active ?? false,
    };

    try {
      let result;
      if (settings?.id) {
        // Update existing settings
        result = await supabase
          .from('whatsapp_settings')
          .update(dataToSave)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('whatsapp_settings')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erro ao salvar configurações:', result.error);
        toast({
          title: "Erro ao salvar",
          description: result.error.message,
          variant: "destructive",
        });
        return false;
      }

      setSettings(result.data as WhatsAppSettings);
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram salvas com sucesso",
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

  const getWhatsAppConfig = (): WhatsAppConfig | null => {
    if (!settings || !settings.is_active) return null;

    return {
      provider: settings.provider,
      base_url: settings.base_url,
      api_key: settings.api_key,
      session_name: settings.session_name,
      account_sid: settings.account_sid,
      auth_token: settings.auth_token,
      phone_number: settings.phone_number,
      access_token: settings.access_token,
      business_account_id: settings.business_account_id,
      webhook_url: settings.webhook_url,
      is_active: settings.is_active,
    };
  };

  const toggleActive = async () => {
    if (!settings) return false;

    const success = await saveSettings({
      is_active: !settings.is_active,
    });

    return success;
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saveSettings,
    getWhatsAppConfig,
    toggleActive,
    refetch: loadSettings,
  };
};
