
import { useState, useCallback, useEffect } from 'react';
import { whatsappService } from '@/services/whatsapp/WhatsAppService';
import { WhatsAppConfig, SendMessageResponse } from '@/services/whatsapp/types';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppSettings } from './useWhatsAppSettings';
import { useAnalytics } from './useAnalytics';

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { settings, getWhatsAppConfig } = useWhatsAppSettings();
  const { trackWhatsAppSent } = useAnalytics();

  const checkConnection = useCallback(async () => {
    console.log('useWhatsApp: Verificando conexão...', { settings });
    
    const config = getWhatsAppConfig();
    console.log('useWhatsApp: Config obtida:', config);
    
    if (!config) {
      console.log('useWhatsApp: Configuração não encontrada');
      setIsConnected(false);
      return false;
    }

    if (!config.is_active) {
      console.log('useWhatsApp: Configuração não está ativa');
      setIsConnected(false);
      return false;
    }

    // Verificar credenciais específicas para Meta
    if (config.provider === 'meta') {
      const hasMetaCredentials = config.access_token && config.business_account_id && config.phone_number;
      console.log('useWhatsApp: Verificando credenciais Meta:', {
        hasAccessToken: !!config.access_token,
        hasBusinessAccountId: !!config.business_account_id,
        hasPhoneNumber: !!config.phone_number,
        allCredentialsPresent: hasMetaCredentials
      });
      
      if (!hasMetaCredentials) {
        console.log('useWhatsApp: Credenciais Meta incompletas');
        setIsConnected(false);
        return false;
      }
    }

    try {
      whatsappService.setConfig(config);
      const connected = await whatsappService.testConnection();
      console.log('useWhatsApp: Resultado do teste de conexão:', connected);
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('useWhatsApp: Erro ao testar conexão:', error);
      setIsConnected(false);
      return false;
    }
  }, [getWhatsAppConfig, settings]);

  useEffect(() => {
    console.log('useWhatsApp: Effect executado, settings mudaram:', settings);
    checkConnection();
  }, [checkConnection, settings]);

  const sendFormLink = useCallback(async (
    phoneNumber: string, 
    formName: string, 
    formUrl: string, 
    customMessage?: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    if (!config || !config.is_active) {
      const errorMsg = !config ? "Configure o WhatsApp nas configurações antes de enviar mensagens." : "Ative o WhatsApp nas configurações antes de enviar mensagens.";
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    const message = customMessage || 
      `📋 *${formName}*\n\nOlá! Você tem um formulário para preencher.\n\n🔗 Acesse o link: ${formUrl}\n\n_Responda assim que possível._`;
    
    try {
      const result = await whatsappService.sendMessage(phoneNumber, message);
      
      if (result.success) {
        toast({
          title: "Link enviado",
          description: `Formulário enviado para ${phoneNumber}`,
        });
        trackWhatsAppSent(phoneNumber, 'form_link');
      } else {
        toast({
          title: "Erro ao enviar",
          description: result.error,
          variant: "destructive",
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, trackWhatsAppSent]);

  const sendMedia = useCallback(async (
    phoneNumber: string,
    mediaUrl: string,
    mediaType: string,
    message?: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    if (!config || !config.is_active) {
      const errorMsg = !config ? "Configure o WhatsApp nas configurações antes de enviar mensagens." : "Ative o WhatsApp nas configurações antes de enviar mensagens.";
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    const defaultMessage = message || 
      `📁 *Conteúdo disponível*\n\nAqui está o seu conteúdo solicitado.\n\n_Obrigado por preencher o formulário!_`;
    
    try {
      const result = await whatsappService.sendMediaMessage(
        phoneNumber, 
        defaultMessage, 
        mediaUrl, 
        mediaType
      );
      
      if (result.success) {
        toast({
          title: "Conteúdo enviado",
          description: `Mídia enviada para ${phoneNumber}`,
        });
        trackWhatsAppSent(phoneNumber, 'media');
      } else {
        toast({
          title: "Erro ao enviar mídia",
          description: result.error,
          variant: "destructive",
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, trackWhatsAppSent]);

  const sendMessage = useCallback(async (
    phoneNumber: string,
    message: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    if (!config || !config.is_active) {
      const errorMsg = !config ? "Configure o WhatsApp nas configurações antes de enviar mensagens." : "Ative o WhatsApp nas configurações antes de enviar mensagens.";
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    try {
      const result = await whatsappService.sendMessage(phoneNumber, message);
      
      if (result.success) {
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada para ${phoneNumber}`,
        });
        trackWhatsAppSent(phoneNumber, 'text');
      } else {
        toast({
          title: "Erro ao enviar",
          description: result.error,
          variant: "destructive",
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, trackWhatsAppSent]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    const config = getWhatsAppConfig();
    console.log('useWhatsApp: testConnection chamado, config:', config);
    
    if (!config) {
      toast({
        title: "Configuração não encontrada",
        description: "Configure o WhatsApp primeiro.",
        variant: "destructive",
      });
      return false;
    }

    if (!config.is_active) {
      toast({
        title: "WhatsApp inativo",
        description: "Ative o WhatsApp nas configurações primeiro.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    try {
      const connected = await whatsappService.testConnection();
      setIsConnected(connected);
      
      toast({
        title: connected ? "Conexão OK" : "Sem conexão",
        description: connected ? 
          "WhatsApp está funcionando corretamente." : 
          "Verifique as configurações do WhatsApp.",
        variant: connected ? "default" : "destructive",
      });
      
      return connected;
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast]);

  return {
    isLoading,
    isConnected,
    sendFormLink,
    sendMedia,
    sendMessage,
    testConnection,
  };
};
