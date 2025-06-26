
import { useState, useCallback } from 'react';
import { whatsappService } from '@/services/whatsapp/WhatsAppService';
import { WhatsAppConfig, WhatsAppMessage, SendMessageResponse } from '@/services/whatsapp/types';
import { useToast } from '@/hooks/use-toast';

export const useWhatsApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const { toast } = useToast();

  const updateConfig = useCallback(async (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    whatsappService.setConfig(newConfig);
    
    // Test connection
    const connected = await whatsappService.testConnection();
    setIsConnected(connected);
    
    if (connected) {
      toast({
        title: "WhatsApp conectado",
        description: "Conexão estabelecida com sucesso.",
      });
    } else {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao WhatsApp.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendFormLink = useCallback(async (
    phoneNumber: string, 
    formName: string, 
    formUrl: string, 
    customMessage?: string
  ): Promise<SendMessageResponse> => {
    setIsLoading(true);
    
    const message = customMessage || 
      `📋 *${formName}*\n\nOlá! Você tem um formulário para preencher.\n\n🔗 Acesse o link: ${formUrl}\n\n_Responda assim que possível._`;
    
    try {
      const result = await whatsappService.sendMessage(phoneNumber, message);
      
      if (result.success) {
        toast({
          title: "Link enviado",
          description: `Formulário enviado para ${phoneNumber}`,
        });
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
  }, [toast]);

  const sendMedia = useCallback(async (
    phoneNumber: string,
    mediaUrl: string,
    mediaType: string,
    message?: string
  ): Promise<SendMessageResponse> => {
    setIsLoading(true);
    
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
  }, [toast]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
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
  }, [toast]);

  return {
    isConnected,
    isLoading,
    config,
    updateConfig,
    sendFormLink,
    sendMedia,
    testConnection,
  };
};
