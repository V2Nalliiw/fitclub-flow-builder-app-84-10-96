
import { useState, useCallback } from 'react';
import { whatsappService } from '@/services/whatsapp/WhatsAppService';
import { WhatsAppConfig, SendMessageResponse } from '@/services/whatsapp/types';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppSettings } from './useWhatsAppSettings';
import { useAnalytics } from './useAnalytics';

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getWhatsAppConfig } = useWhatsAppSettings();
  const { trackWhatsAppSent } = useAnalytics();

  const sendFormLink = useCallback(async (
    phoneNumber: string, 
    formName: string, 
    formUrl: string, 
    customMessage?: string
  ): Promise<SendMessageResponse> => {
    const config = getWhatsAppConfig();
    if (!config) {
      toast({
        title: "WhatsApp não configurado",
        description: "Configure o WhatsApp nas configurações antes de enviar mensagens.",
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
    if (!config) {
      toast({
        title: "WhatsApp não configurado",
        description: "Configure o WhatsApp nas configurações antes de enviar mensagens.",
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
    if (!config) {
      toast({
        title: "WhatsApp não configurado",
        description: "Configure o WhatsApp nas configurações antes de enviar mensagens.",
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
    if (!config) {
      toast({
        title: "Configuração não encontrada",
        description: "Configure o WhatsApp primeiro.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    whatsappService.setConfig(config);
    
    try {
      const connected = await whatsappService.testConnection();
      
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
    sendFormLink,
    sendMedia,
    sendMessage,
    testConnection,
  };
};
