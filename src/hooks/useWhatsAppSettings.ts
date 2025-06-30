
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
      // Sempre carrega as configurações globais primeiro
      console.log('useWhatsAppSettings: Carregando configurações globais');
      const { data: globalData, error: globalError } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .is('clinic_id', null)
        .single();

      console.log('useWhatsAppSettings: Resultado global:', { globalData, globalError });

      if (globalError && globalError.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações globais do WhatsApp:', globalError);
      }

      // Define as configurações globais
      let typedGlobalData: WhatsAppSettings | null = null;
      if (globalData) {
        typedGlobalData = {
          ...globalData,
          provider: globalData.provider as 'evolution' | 'meta' | 'twilio'
        };
        console.log('useWhatsAppSettings: Configurações globais carregadas:', typedGlobalData);
        setGlobalSettings(typedGlobalData);
      } else {
        console.log('useWhatsAppSettings: Nenhuma configuração global encontrada');
        setGlobalSettings(null);
      }

      if (user.role === 'super_admin') {
        // Super admin trabalha apenas com configurações globais
        console.log('useWhatsAppSettings: Super admin - usando configurações globais');
        setSettings(typedGlobalData);
      } else {
        // Para usuários de clínica, tenta carregar configurações da clínica
        console.log('useWhatsAppSettings: Carregando configurações da clínica:', user.clinic_id);
        
        const { data: clinicData, error: clinicError } = await supabase
          .from('whatsapp_settings')
          .select('*')
          .eq('clinic_id', user.clinic_id)
          .single();

        console.log('useWhatsAppSettings: Resultado da clínica:', { clinicData, clinicError });

        if (clinicData) {
          // Clínica tem suas próprias configurações
          const typedClinicData: WhatsAppSettings = {
            ...clinicData,
            provider: clinicData.provider as 'evolution' | 'meta' | 'twilio'
          };
          console.log('useWhatsAppSettings: Usando configurações específicas da clínica:', typedClinicData);
          setSettings(typedClinicData);
        } else {
          // Clínica não tem configurações próprias, usa as globais como fallback
          if (typedGlobalData) {
            console.log('useWhatsAppSettings: Clínica usando configurações globais como fallback');
            // Cria uma versão das configurações globais marcada como herdada
            const inheritedGlobalSettings = {
              ...typedGlobalData,
              id: 'inherited-global', // ID especial para indicar herança
              clinic_id: null, // Mantém null para indicar que é global
            };
            setSettings(inheritedGlobalSettings);
          } else {
            console.log('useWhatsAppSettings: Nenhuma configuração disponível (nem da clínica nem global)');
            setSettings(null);
          }
        }

        if (clinicError && clinicError.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações da clínica:', clinicError);
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
      
      // Para super admin, sempre trabalha com configurações globais
      if (user.role === 'super_admin') {
        if (settings?.id && settings.clinic_id === null) {
          // Update existing global settings
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
          // Create new global settings
          result = await supabase
            .from('whatsapp_settings')
            .insert({
              clinic_id: null,
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
      } else {
        // Para usuários de clínica
        // Verifica se tem configurações específicas da clínica (não herdadas)
        const hasOwnClinicSettings = settings?.clinic_id === clinicId && settings?.id !== 'inherited-global';
        
        if (settings?.id && hasOwnClinicSettings) {
          // Update existing clinic settings
          result = await supabase
            .from('whatsapp_settings')
            .update({
              provider: settingsData.provider || settings.provider,
              base_url: settingsData.base_url ?? settings.base_url,
              api_key: settingsData.api_key ?? settings.api_key,
              session_name: settingsData.session_name ?? settings.session_name,
              account_sid: settingsData.account_sid ?? settings.account_sid,
              auth_token: settingsData.auth_token ?? settings.auth_token,
              phone_number: settingsData.phone_number ?? settings.phone_number,
              access_token: settingsData.access_token ?? settings.access_token,
              business_account_id: settingsData.business_account_id ?? settings.business_account_id,
              webhook_url: settingsData.webhook_url ?? settings.webhook_url,
              is_active: settingsData.is_active ?? settings.is_active,
            })
            .eq('id', settings.id)
            .select()
            .single();
        } else {
          // Create new clinic-specific settings
          // Se está herdando configurações globais, usa elas como base
          const baseSettings = globalSettings || {
            provider: 'evolution' as const,
            base_url: null,
            api_key: null,
            session_name: null,
            account_sid: null,
            auth_token: null,
            phone_number: null,
            access_token: null,
            business_account_id: null,
            webhook_url: null,
          };
          
          result = await supabase
            .from('whatsapp_settings')
            .insert({
              clinic_id: clinicId,
              provider: settingsData.provider || baseSettings.provider,
              base_url: settingsData.base_url ?? baseSettings.base_url,
              api_key: settingsData.api_key ?? baseSettings.api_key,
              session_name: settingsData.session_name ?? baseSettings.session_name,
              account_sid: settingsData.account_sid ?? baseSettings.account_sid,
              auth_token: settingsData.auth_token ?? baseSettings.auth_token,
              phone_number: settingsData.phone_number ?? baseSettings.phone_number,
              access_token: settingsData.access_token ?? baseSettings.access_token,
              business_account_id: settingsData.business_account_id ?? baseSettings.business_account_id,
              webhook_url: settingsData.webhook_url ?? baseSettings.webhook_url,
              is_active: settingsData.is_active ?? false,
            })
            .select()
            .single();
        }
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
      
      // Se salvou configurações globais, atualiza também as globais
      if (user.role === 'super_admin') {
        setGlobalSettings(typedResult);
      }
      
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
    console.log('useWhatsAppSettings: getWhatsAppConfig chamado');
    console.log('useWhatsAppSettings: Current settings:', settings);
    console.log('useWhatsAppSettings: Global settings:', globalSettings);
    console.log('useWhatsAppSettings: User role:', user?.role);
    
    if (!settings) {
      console.log('useWhatsAppSettings: Nenhuma configuração encontrada');
      return null;
    }

    if (!settings.is_active) {
      console.log('useWhatsAppSettings: Configuração não está ativa');
      return null;
    }

    // Se está usando configurações herdadas, mas elas não estão ativas na clínica
    if (settings.id === 'inherited-global' && !settings.is_active) {
      console.log('useWhatsAppSettings: Configurações globais herdadas não estão ativas para a clínica');
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

    console.log('useWhatsAppSettings: Config retornada:', config);
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
    console.log('useWhatsAppSettings: isUsingGlobalSettings chamado');
    console.log('useWhatsAppSettings: Current settings:', settings);
    console.log('useWhatsAppSettings: User role:', user?.role);
    
    // Super admin never "uses" global settings - they manage them directly
    if (user?.role === 'super_admin') {
      console.log('useWhatsAppSettings: Super admin - retornando false');
      return false;
    }
    
    // For clinic users: return true if they are using global settings as fallback
    // This happens when settings exist but clinic_id is null (inherited from global)
    // OR when the settings ID is our special inherited marker
    const usingGlobal = settings?.clinic_id === null || settings?.id === 'inherited-global';
    console.log('useWhatsAppSettings: Clinic user - usando global:', usingGlobal);
    return usingGlobal;
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
