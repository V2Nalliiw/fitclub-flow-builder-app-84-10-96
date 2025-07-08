
import { useState, useCallback, useEffect } from 'react';
import { whatsappService } from '@/services/whatsapp/WhatsAppService';
import { WhatsAppConfig, SendMessageResponse } from '@/services/whatsapp/types';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppSettings } from './useWhatsAppSettings';
import { useAnalytics } from './useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsAppTemplates } from './useWhatsAppTemplates';

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { settings, getWhatsAppConfig, isUsingGlobalSettings } = useWhatsAppSettings();
  const { trackWhatsAppSent } = useAnalytics();
  const { user } = useAuth();
  const { renderTemplate } = useWhatsAppTemplates();

  const checkConnection = useCallback(async () => {
    console.log('useWhatsApp: Verificando conexão...');
    console.log('useWhatsApp: Settings atuais:', settings);
    console.log('useWhatsApp: Usando global?', isUsingGlobalSettings());
    
    const config = getWhatsAppConfig();
    console.log('useWhatsApp: Config obtida do getWhatsAppConfig:', config);
    
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

    // Verificar credenciais específicas para cada provider
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
    } else if (config.provider === 'evolution') {
      const hasEvolutionCredentials = config.base_url && config.api_key && config.session_name;
      console.log('useWhatsApp: Verificando credenciais Evolution:', {
        hasBaseUrl: !!config.base_url,
        hasApiKey: !!config.api_key,
        hasSessionName: !!config.session_name,
        allCredentialsPresent: hasEvolutionCredentials
      });
      
      if (!hasEvolutionCredentials) {
        console.log('useWhatsApp: Credenciais Evolution incompletas');
        setIsConnected(false);
        return false;
      }
    } else if (config.provider === 'twilio') {
      const hasTwilioCredentials = config.account_sid && config.auth_token && config.phone_number;
      console.log('useWhatsApp: Verificando credenciais Twilio:', {
        hasAccountSid: !!config.account_sid,
        hasAuthToken: !!config.auth_token,
        hasPhoneNumber: !!config.phone_number,
        allCredentialsPresent: hasTwilioCredentials
      });
      
      if (!hasTwilioCredentials) {
        console.log('useWhatsApp: Credenciais Twilio incompletas');
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
  }, [getWhatsAppConfig, settings, isUsingGlobalSettings]);

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
    const usingGlobal = isUsingGlobalSettings();
    
    console.log('useWhatsApp: sendFormLink - config:', config);
    console.log('useWhatsApp: sendFormLink - usando global:', usingGlobal);
    
    if (!config || !config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      const errorMsg = !config ? 
        `Configure o WhatsApp ${usingGlobal ? 'global (nas configurações do admin)' : 'da clínica'} antes de enviar mensagens.` : 
        `Ative o WhatsApp ${configType} nas configurações antes de enviar mensagens.`;
      
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    // Usar template ou mensagem customizada
    let message: string;
    if (customMessage) {
      message = customMessage;
    } else {
      try {
        message = await renderTemplate('envio_formulario', {
          form_name: formName,
          patient_name: '', // Pode ser passado como parâmetro no futuro
          form_url: formUrl
        });
      } catch (error) {
        console.warn('useWhatsApp: Erro ao renderizar template, usando fallback:', error);
        message = `📋 *${formName}*\n\nOlá! Você tem um formulário para preencher.\n\n🔗 Acesse o link: ${formUrl}\n\n_Responda assim que possível._`;
      }
    }
    
    try {
      const result = await whatsappService.sendMessage(phoneNumber, message);
      
      if (result.success) {
        const configSource = usingGlobal ? " (usando API global)" : "";
        toast({
          title: "Link enviado",
          description: `Formulário enviado para ${phoneNumber}${configSource}`,
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
  }, [getWhatsAppConfig, toast, trackWhatsAppSent, isUsingGlobalSettings]);

  const sendMedia = useCallback(async (
    phoneNumber: string,
    mediaUrl: string,
    mediaType: string,
    message?: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    const usingGlobal = isUsingGlobalSettings();
    
    if (!config || !config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      const errorMsg = !config ? 
        `Configure o WhatsApp ${usingGlobal ? 'global (nas configurações do admin)' : 'da clínica'} antes de enviar mensagens.` : 
        `Ative o WhatsApp ${configType} nas configurações antes de enviar mensagens.`;
      
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
        const configSource = usingGlobal ? " (usando API global)" : "";
        toast({
          title: "Conteúdo enviado",
          description: `Mídia enviada para ${phoneNumber}${configSource}`,
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
  }, [getWhatsAppConfig, toast, trackWhatsAppSent, isUsingGlobalSettings]);

  const sendMessage = useCallback(async (
    phoneNumber: string,
    message: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    const usingGlobal = isUsingGlobalSettings();
    
    console.log('useWhatsApp: sendMessage - config:', config);
    console.log('useWhatsApp: sendMessage - usando global:', usingGlobal);
    
    if (!config || !config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      const errorMsg = !config ? 
        `Configure o WhatsApp ${usingGlobal ? 'global (nas configurações do admin)' : 'da clínica'} antes de enviar mensagens.` : 
        `Ative o WhatsApp ${configType} nas configurações antes de enviar mensagens.`;
      
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
        const configSource = usingGlobal ? " (usando API global)" : "";
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada para ${phoneNumber}${configSource}`,
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
  }, [getWhatsAppConfig, toast, trackWhatsAppSent, isUsingGlobalSettings]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    const config = getWhatsAppConfig();
    const usingGlobal = isUsingGlobalSettings();
    
    console.log('useWhatsApp: testConnection chamado');
    console.log('useWhatsApp: testConnection - config:', config);
    console.log('useWhatsApp: testConnection - usando global:', usingGlobal);
    
    if (!config) {
      const configType = usingGlobal ? "global (configure nas configurações do admin)" : "da clínica";
      toast({
        title: "Configuração não encontrada",
        description: `Configure o WhatsApp ${configType} primeiro.`,
        variant: "destructive",
      });
      return false;
    }

    if (!config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      toast({
        title: "WhatsApp inativo",
        description: `Ative o WhatsApp ${configType} nas configurações primeiro.`,
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    try {
      const connected = await whatsappService.testConnection();
      setIsConnected(connected);
      
      const configSource = usingGlobal ? " (API global)" : " (API da clínica)";
      toast({
        title: connected ? "Conexão OK" : "Sem conexão",
        description: connected ? 
          `WhatsApp está funcionando corretamente${configSource}.` : 
          `Verifique as configurações do WhatsApp${configSource}.`,
        variant: connected ? "default" : "destructive",
      });
      
      return connected;
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, isUsingGlobalSettings]);

  const sendVerificationCode = useCallback(async (
    to: string,
    code: string
  ): Promise<SendMessageResponse> => {
    console.log('useWhatsApp: sendVerificationCode chamado:', { to, code });
    
    const config = getWhatsAppConfig();
    const usingGlobal = isUsingGlobalSettings();
    
    if (!config || !config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      const errorMsg = !config ? 
        `Configure o WhatsApp ${usingGlobal ? 'global (nas configurações do admin)' : 'da clínica'} antes de enviar códigos.` : 
        `Ative o WhatsApp ${configType} nas configurações antes de enviar códigos.`;
      
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    if (config.provider !== 'meta') {
      toast({
        title: "Provider incompatível",
        description: "Código de verificação só funciona com Meta WhatsApp Business API",
        variant: "destructive",
      });
      return { success: false, error: "Provider não suportado para códigos de verificação" };
    }

    if (!config.access_token) {
      toast({
        title: "Access Token necessário",
        description: "Configure o Access Token do Meta WhatsApp para enviar códigos",
        variant: "destructive",
      });
      return { success: false, error: "Access Token não configurado" };
    }

    setIsLoading(true);
    
    try {
      // Usar phone number ID fixo conforme especificado
      const fixedPhoneNumberId = "685174371347679";
      
      // Criar configuração temporária com phone number ID fixo
      const configWithFixedPhone = {
        ...config,
        phone_number: fixedPhoneNumberId
      };
      
      whatsappService.setConfig(configWithFixedPhone);
      
      console.log('useWhatsApp: Enviando código via template oficial Meta:', {
        to,
        code,
        template: 'codigo_verificacao',
        language: 'pt_BR',
        phoneNumberId: fixedPhoneNumberId
      });

      const result = await whatsappService.sendMessage(to, ''); // Usaremos o método sendTemplate
      
      // Como não temos acesso direto ao MetaWhatsAppService aqui, vamos implementar via fetch
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${fixedPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/\D/g, ''),
            type: 'template',
            template: {
              name: 'codigo_verificacao',
              language: {
                code: 'pt_BR'
              },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: code
                    }
                  ]
                }
              ]
            }
          }),
        }
      );

      const data = await response.json();
      console.log('useWhatsApp: Resposta do código de verificação:', data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error?.error_user_msg || 'Erro ao enviar código';
        toast({
          title: "Erro ao enviar código",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      const configSource = usingGlobal ? " (usando API global)" : "";
      toast({
        title: "Código enviado",
        description: `Código de verificação enviado para ${to}${configSource}`,
      });
      
      trackWhatsAppSent(to, 'verification_code');
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        response: data,
      };
      
    } catch (error: any) {
      console.error('useWhatsApp: Erro ao enviar código de verificação:', error);
      toast({
        title: "Erro ao enviar código",
        description: error.message || 'Erro de conexão com a API do WhatsApp',
        variant: "destructive",
      });
      return { success: false, error: error.message || 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, trackWhatsAppSent, isUsingGlobalSettings]);

  const sendWhatsAppTemplateMessage = useCallback(async (
    phoneNumber: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<SendMessageResponse> => {
    console.log('useWhatsApp: sendWhatsAppTemplateMessage chamado:', { phoneNumber, templateName, variables });
    
    const config = getWhatsAppConfig();
    const usingGlobal = isUsingGlobalSettings();
    
    if (!config || !config.is_active) {
      const configType = usingGlobal ? "global" : "da clínica";
      const errorMsg = !config ? 
        `Configure o WhatsApp ${usingGlobal ? 'global (nas configurações do admin)' : 'da clínica'} antes de enviar mensagens.` : 
        `Ative o WhatsApp ${configType} nas configurações antes de enviar mensagens.`;
      
      toast({
        title: "WhatsApp não configurado",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    setIsLoading(true);
    
    try {
      // Renderizar template com variáveis
      const message = await renderTemplate(templateName, variables);
      
      // Enviar mensagem
      const result = await sendMessage(phoneNumber, message);
      
      if (result.success) {
        console.log('Template enviado com sucesso:', templateName);
        trackWhatsAppSent(phoneNumber, 'template');
      }
      
      return result;
    } catch (error: any) {
      console.error('useWhatsApp: Erro ao enviar template:', error);
      toast({
        title: "Erro ao enviar template",
        description: error.message || 'Erro ao processar template',
        variant: "destructive",
      });
      return { success: false, error: error.message || 'Erro ao processar template' };
    } finally {
      setIsLoading(false);
    }
  }, [getWhatsAppConfig, toast, trackWhatsAppSent, isUsingGlobalSettings, renderTemplate, sendMessage]);

  return {
    isLoading,
    isConnected,
    sendFormLink,
    sendMedia,
    sendMessage,
    sendVerificationCode,
    sendWhatsAppTemplateMessage,
    testConnection,
    isUsingGlobalSettings,
  };
};
