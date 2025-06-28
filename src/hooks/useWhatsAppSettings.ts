
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
      // Since whatsapp_settings table doesn't exist, we'll use notifications table to store settings
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('category', 'whatsapp_settings')
        .eq('metadata->>clinic_id', user.clinic_id)
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
        // Transform notification data to WhatsAppSettings
        const metadata = data.metadata as any;
        const transformedSettings: WhatsAppSettings = {
          id: data.id,
          clinic_id: user.clinic_id,
          provider: metadata.provider || 'evolution',
          base_url: metadata.base_url,
          api_key: metadata.api_key,
          session_name: metadata.session_name,
          account_sid: metadata.account_sid,
          auth_token: metadata.auth_token,
          phone_number: metadata.phone_number,
          access_token: metadata.access_token,
          business_account_id: metadata.business_account_id,
          webhook_url: metadata.webhook_url,
          is_active: metadata.is_active || false,
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
        };
        setSettings(transformedSettings);
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

    // Prepare metadata with all WhatsApp settings
    const metadata = {
      clinic_id: user.clinic_id,
      provider: settingsData.provider || 'evolution',
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
          .from('notifications')
          .update({
            title: 'WhatsApp Settings',
            message: 'Configurações do WhatsApp',
            metadata: metadata
          })
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'WhatsApp Settings',
            message: 'Configurações do WhatsApp',
            type: 'settings',
            category: 'whatsapp_settings',
            metadata: metadata
          })
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

      // Transform and set the updated settings
      const updatedMetadata = result.data.metadata as any;
      const transformedSettings: WhatsAppSettings = {
        id: result.data.id,
        clinic_id: user.clinic_id,
        provider: updatedMetadata.provider || 'evolution',
        base_url: updatedMetadata.base_url,
        api_key: updatedMetadata.api_key,
        session_name: updatedMetadata.session_name,
        account_sid: updatedMetadata.account_sid,
        auth_token: updatedMetadata.auth_token,
        phone_number: updatedMetadata.phone_number,
        access_token: updatedMetadata.access_token,
        business_account_id: updatedMetadata.business_account_id,
        webhook_url: updatedMetadata.webhook_url,
        is_active: updatedMetadata.is_active || false,
        created_at: result.data.created_at || '',
        updated_at: result.data.updated_at || '',
      };

      setSettings(transformedSettings);
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
