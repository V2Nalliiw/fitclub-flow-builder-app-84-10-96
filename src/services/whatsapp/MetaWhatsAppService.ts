
import { WhatsAppConfig, WhatsAppMessage, SendMessageResponse } from './types';

export class MetaWhatsAppService {
  private config: WhatsAppConfig | null = null;

  setConfig(config: WhatsAppConfig) {
    this.config = config;
    console.log('Meta WhatsApp: Configuração definida', {
      provider: config.provider,
      hasAccessToken: !!config.access_token,
      hasBusinessAccountId: !!config.business_account_id,
      hasPhoneNumber: !!config.phone_number,
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.config || this.config.provider !== 'meta') {
      console.error('Meta WhatsApp: Configuração inválida ou provedor incorreto', {
        hasConfig: !!this.config,
        provider: this.config?.provider
      });
      return false;
    }

    if (!this.config.access_token || !this.config.business_account_id) {
      console.error('Meta WhatsApp: Credenciais obrigatórias não fornecidas', {
        hasAccessToken: !!this.config.access_token,
        hasBusinessAccountId: !!this.config.business_account_id,
        accessTokenPreview: this.config.access_token ? `${this.config.access_token.substring(0, 10)}...` : 'não fornecido'
      });
      return false;
    }

    try {
      console.log('Meta WhatsApp: Iniciando teste de conexão...');
      
      // Teste 1: Verificar se o business account é válido
      const businessUrl = `https://graph.facebook.com/v18.0/${this.config.business_account_id}?fields=id,name`;
      console.log('Meta WhatsApp: Testando URL do business:', businessUrl);
      
      const businessResponse = await fetch(businessUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Meta WhatsApp: Status da resposta do business:', businessResponse.status);

      if (!businessResponse.ok) {
        const errorText = await businessResponse.text();
        console.error('Meta WhatsApp: Erro na resposta do business account:', {
          status: businessResponse.status,
          statusText: businessResponse.statusText,
          errorText
        });
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('Meta WhatsApp: Dados do erro parseados:', errorData);
        } catch (e) {
          console.error('Meta WhatsApp: Não foi possível parsear o erro como JSON');
        }
        
        return false;
      }

      const businessData = await businessResponse.json();
      console.log('Meta WhatsApp: Business account válido:', businessData);

      // Teste 2: Verificar se o phone number ID é válido (se fornecido)
      if (this.config.phone_number) {
        const phoneUrl = `https://graph.facebook.com/v18.0/${this.config.phone_number}?fields=id,display_phone_number,verified_name,quality_rating`;
        console.log('Meta WhatsApp: Testando URL do phone number:', phoneUrl);
        
        const phoneResponse = await fetch(phoneUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Meta WhatsApp: Status da resposta do phone number:', phoneResponse.status);

        if (!phoneResponse.ok) {
          const phoneErrorText = await phoneResponse.text();
          console.error('Meta WhatsApp: Erro na resposta do phone number:', {
            status: phoneResponse.status,
            statusText: phoneResponse.statusText,
            errorText: phoneErrorText
          });
          
          try {
            const phoneErrorData = JSON.parse(phoneErrorText);
            console.error('Meta WhatsApp: Dados do erro do phone parseados:', phoneErrorData);
          } catch (e) {
            console.error('Meta WhatsApp: Não foi possível parsear o erro do phone como JSON');
          }
          
          return false;
        }

        const phoneData = await phoneResponse.json();
        console.log('Meta WhatsApp: Phone number verificado com sucesso:', phoneData);
      }

      console.log('Meta WhatsApp: Conexão bem-sucedida!');
      return true;
    } catch (error) {
      console.error('Meta WhatsApp: Erro de rede ou exceção durante o teste:', error);
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
      
      // Limpar o número de telefone (remover caracteres não numéricos)
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
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
            to: cleanPhoneNumber,
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
        const errorMessage = data.error?.message || data.error?.error_user_msg || 'Erro ao enviar mensagem';
        console.error('Meta WhatsApp: Erro na resposta:', data);
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        response: data,
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
      
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const whatsappMediaType = this.getMediaType(mediaType);
      
      // Para a API do Meta, podemos enviar a URL da mídia diretamente
      const messagePayload: any = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: whatsappMediaType,
        [whatsappMediaType]: {
          link: mediaUrl,
        },
      };

      // Adicionar caption se fornecida
      if (message && message.trim()) {
        messagePayload[whatsappMediaType].caption = message;
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta do envio de mídia:', data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error?.error_user_msg || 'Erro ao enviar mídia';
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        response: data,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao enviar mídia:', error);
      return {
        success: false,
        error: 'Erro de conexão com a API do WhatsApp',
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
      
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      const templatePayload: any = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      // Adicionar parâmetros se fornecidos
      if (parameters.length > 0) {
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: parameters.map(param => ({
              type: 'text',
              text: param,
            })),
          },
        ];
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templatePayload),
        }
      );

      const data = await response.json();
      console.log('Meta WhatsApp: Resposta do template:', data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error?.error_user_msg || 'Erro ao enviar template';
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        response: data,
      };
    } catch (error) {
      console.error('Meta WhatsApp: Erro ao enviar template:', error);
      return {
        success: false,
        error: 'Erro de conexão com a API do WhatsApp',
      };
    }
  }

  async getBusinessProfile(): Promise<any> {
    if (!this.config || !this.config.access_token || !this.config.business_account_id) {
      return null;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.business_account_id}?fields=id,name,phone_numbers`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao obter perfil do business:', error);
    }

    return null;
  }

  async getPhoneNumberInfo(): Promise<any> {
    if (!this.config || !this.config.access_token || !this.config.phone_number) {
      return null;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number}?fields=id,display_phone_number,verified_name,quality_rating`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao obter informações do número:', error);
    }

    return null;
  }
}
