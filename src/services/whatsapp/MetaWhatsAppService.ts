
import { WhatsAppConfig, WhatsAppMessage, SendMessageResponse } from './types';

export class MetaWhatsAppService {
  private config: WhatsAppConfig | null = null;

  setConfig(config: WhatsAppConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    if (!this.config || this.config.provider !== 'meta') {
      console.error('Meta WhatsApp: Configuração inválida');
      return false;
    }

    if (!this.config.access_token || !this.config.business_account_id) {
      console.error('Meta WhatsApp: Access token ou Business Account ID não fornecidos');
      return false;
    }

    try {
      console.log('Testando conexão Meta WhatsApp...');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.business_account_id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
          },
        }
      );

      if (response.ok) {
        console.log('Meta WhatsApp: Conexão bem-sucedida');
        return true;
      } else {
        const errorData = await response.json();
        console.error('Meta WhatsApp: Erro na conexão:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao testar conexão:', error);
      return false;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<SendMessageResponse> {
    if (!this.config || this.config.provider !== 'meta') {
      return {
        success: false,
        error: 'Configuração do Meta WhatsApp não encontrada ou inválida',
      };
    }

    if (!this.config.access_token || !this.config.phone_number) {
      return {
        success: false,
        error: 'Access token ou Phone Number ID não configurados',
      };
    }

    try {
      console.log('Enviando mensagem via Meta WhatsApp para:', phoneNumber);
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber.replace(/\D/g, ''), // Remove non-digits
            type: 'text',
            text: {
              body: message,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta da API:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Erro ao enviar mensagem',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: 'Erro de conexão com a API do WhatsApp',
      };
    }
  }

  async sendMediaMessage(
    phoneNumber: string,
    message: string,
    mediaUrl: string,
    mediaType: string
  ): Promise<SendMessageResponse> {
    if (!this.config || this.config.provider !== 'meta') {
      return {
        success: false,
        error: 'Configuração do Meta WhatsApp não encontrada ou inválida',
      };
    }

    if (!this.config.access_token || !this.config.phone_number) {
      return {
        success: false,
        error: 'Access token ou Phone Number ID não configurados',
      };
    }

    try {
      console.log('Enviando mídia via Meta WhatsApp para:', phoneNumber);
      
      // First upload the media
      const uploadResponse = await this.uploadMedia(mediaUrl, mediaType);
      if (!uploadResponse.success) {
        return uploadResponse;
      }

      // Then send the message with media
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber.replace(/\D/g, ''),
            type: this.getMediaType(mediaType),
            [this.getMediaType(mediaType)]: {
              id: uploadResponse.mediaId,
              caption: message,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta do envio de mídia:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Erro ao enviar mídia',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao enviar mídia:', error);
      return {
        success: false,
        error: 'Erro de conexão com a API do WhatsApp',
      };
    }
  }

  private async uploadMedia(mediaUrl: string, mediaType: string): Promise<SendMessageResponse & { mediaId?: string }> {
    if (!this.config?.access_token || !this.config?.phone_number) {
      return {
        success: false,
        error: 'Configuração inválida para upload de mídia',
      };
    }

    try {
      console.log('Fazendo upload de mídia para Meta WhatsApp:', mediaUrl);
      
      const formData = new FormData();
      formData.append('file', mediaUrl);
      formData.append('type', mediaType);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta do upload:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Erro ao fazer upload da mídia',
        };
      }

      return {
        success: true,
        mediaId: data.id,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao fazer upload de mídia:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload da mídia',
      };
    }
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'document';
    return 'document';
  }

  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    parameters: string[] = []
  ): Promise<SendMessageResponse> {
    if (!this.config || this.config.provider !== 'meta') {
      return {
        success: false,
        error: 'Configuração do Meta WhatsApp não encontrada ou inválida',
      };
    }

    if (!this.config.access_token || !this.config.phone_number) {
      return {
        success: false,
        error: 'Access token ou Phone Number ID não configurados',
      };
    }

    try {
      console.log('Enviando template via Meta WhatsApp:', templateName);
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber.replace(/\D/g, ''),
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: languageCode,
              },
              components: parameters.length > 0 ? [
                {
                  type: 'body',
                  parameters: parameters.map(param => ({
                    type: 'text',
                    text: param,
                  })),
                },
              ] : [],
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta do template:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Erro ao enviar template',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao enviar template:', error);
      return {
        success: false,
        error: 'Erro de conexão com a API do WhatsApp',
      };
    }
  }
}
