
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppConfig } from '@/services/whatsapp/types';

export interface WhatsAppSettings {
  id: string;
  clinic_id: string | null;
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
  const [globalSettings, setGlobalSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user) {
      console.log('useWhatsAppSettings: Usuário não encontrado');
      setLoading(false);
      return;
    }

    console.log('useWhatsAppSettings: Carregando configurações para usuário:', user);
    setLoading(true);
    try {
      if (user.role === 'super_admin') {
        // Super admin only loads global settings
        console.log('useWhatsAppSettings: Carregando configurações globais (super admin)');
        const { data: globalData, error: globalError } = await supabase
          .from('whatsapp_settings')
          .select('*')
          .is('clinic_id', null)
          .single();

        console.log('useWhatsAppSettings: Resultado global:', { globalData, globalError });

        if (globalError && globalError.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações globais do WhatsApp:', globalError);
          toast({
            title: "Erro ao carregar configurações",
            description: globalError.message,
            variant: "destructive",
          });
          return;
        }

        if (globalData) {
          const typedData: WhatsAppSettings = {
            ...globalData,
            provider: globalData.provider as 'evolution' | 'meta' | 'twilio'
          };
          console.log('useWhatsAppSettings: Configurações globais carregadas:', typedData);
          setSettings(typedData);
          setGlobalSettings(typedData);
        } else {
          console.log('useWhatsAppSettings: Nenhuma configuração global encontrada');
          setSettings(null);
          setGlobalSettings(null);
        }
      } else {
        // For clinic users, load both clinic and global settings
        console.log('useWhatsAppSettings: Carregando configurações da clínica:', user.clinic_id);
        
        // Load clinic settings
        const { data: clinicData, error: clinicError } = await supabase
          .from('whatsapp_settings')
          .select('*')
          .eq('clinic_id', user.clinic_id)
          .single();

        // Load global settings as fallback
        const { data: globalData, error: globalError } = await supabase
          .from('whatsapp_settings')
          .select('*')
          .is('clinic_id', null)
          .single();

        console.log('useWhatsAppSettings: Resultado da clínica:', { clinicData, clinicError });
        console.log('useWhatsAppSettings: Resultado global (fallback):', { globalData, globalError });

        // Set global settings
        if (globalData) {
          const typedGlobalData: WhatsAppSettings = {
            ...globalData,
            provider: globalData.provider as 'evolution' | 'meta' | 'twilio'
          };
          setGlobalSettings(typedGlobalData);
        }

        // Set clinic settings (primary) or use global as fallback
        if (clinicData) {
          const typedData: WhatsAppSettings = {
            ...clinicData,
            provider: clinicData.provider as 'evolution' | 'meta' | 'twilio'
          };
          console.log('useWhatsAppSettings: Configurações da clínica carregadas:', typedData);
          setSettings(typedData);
        } else if (globalData) {
          // Use global settings as fallback for the clinic
          const typedGlobalData: WhatsAppSettings = {
            ...globalData,
            provider: globalData.provider as 'evolution' | 'meta' | 'twilio'
          };
          console.log('useWhatsAppSettings: Usando configurações globais como fallback para clínica');
          setSettings(typedGlobalData);
        } else {
          console.log('useWhatsAppSettings: Nenhuma configuração encontrada');
          setSettings(null);
        }

        if (clinicError && clinicError.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações da clínica:', clinicError);
        }
        if (globalError && globalError.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações globais:', globalError);
        }
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
  }, [user, toast]);

  const saveSettings = async (settingsData: Partial<WhatsAppSettings>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive",
      });
      return false;
    }

    try {
      let result;
      
      // Determine clinic_id based on user role
      const clinicId = user.role === 'super_admin' ? null : user.clinic_id;
      
      // Check if we have existing clinic settings (not global fallback)
      const hasClinicSettings = settings?.clinic_id === clinicId;
      
      if (settings?.id && hasClinicSettings) {
        // Update existing settings
        result = await supabase
          .from('whatsapp_settings')
          .update({
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
          })
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('whatsapp_settings')
          .insert({
            clinic_id: clinicId,
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

      // Type assertion for the saved data
      const typedResult: WhatsAppSettings = {
        ...result.data,
        provider: result.data.provider as 'evolution' | 'meta' | 'twilio'
      };
      
      setSettings(typedResult);
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
    console.log('useWhatsAppSettings: getWhatsAppConfig chamado, settings:', settings);
    
    if (!settings) {
      console.log('useWhatsAppSettings: Settings não encontradas');
      return null;
    }

    if (!settings.is_active) {
      console.log('useWhatsAppSettings: Settings não estão ativas');
      return null;
    }

    const config: WhatsAppConfig = {
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

    console.log('useWhatsAppSettings: Config gerada:', config);
    return config;
  };

  const toggleActive = async () => {
    if (!settings) return false;

    const success = await saveSettings({
      is_active: !settings.is_active,
    });

    return success;
  };

  const isUsingGlobalSettings = () => {
    return settings?.clinic_id === null && user?.role !== 'super_admin';
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    globalSettings,
    loading,
    saveSettings,
    getWhatsAppConfig,
    toggleActive,
    refetch: loadSettings,
    isUsingGlobalSettings,
  };
};
