
import { WhatsAppConfig, WhatsAppMessage, SendMessageResponse } from './types';
import { MetaWhatsAppService } from './MetaWhatsAppService';

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private metaService = new MetaWhatsAppService();

  setConfig(config: WhatsAppConfig) {
    this.config = config;
    
    if (config.provider === 'meta') {
      this.metaService.setConfig(config);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) return false;

    switch (this.config.provider) {
      case 'meta':
        return this.metaService.testConnection();
      case 'evolution':
        return this.testEvolutionConnection();
      case 'twilio':
        return this.testTwilioConnection();
      default:
        return false;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<SendMessageResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'Configuração do WhatsApp não encontrada',
      };
    }

    switch (this.config.provider) {
      case 'meta':
        return this.metaService.sendMessage(phoneNumber, message);
      case 'evolution':
        return this.sendEvolutionMessage(phoneNumber, message);
      case 'twilio':
        return this.sendTwilioMessage(phoneNumber, message);
      default:
        return {
          success: false,
          error: 'Provedor de WhatsApp não suportado',
        };
    }
  }

  async sendMediaMessage(
    phoneNumber: string,
    message: string,
    mediaUrl: string,
    mediaType: string
  ): Promise<SendMessageResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'Configuração do WhatsApp não encontrada',
      };
    }

    switch (this.config.provider) {
      case 'meta':
        return this.metaService.sendMediaMessage(phoneNumber, message, mediaUrl, mediaType);
      case 'evolution':
        return this.sendEvolutionMediaMessage(phoneNumber, message, mediaUrl, mediaType);
      case 'twilio':
        return this.sendTwilioMediaMessage(phoneNumber, message, mediaUrl, mediaType);
      default:
        return {
          success: false,
          error: 'Provedor de WhatsApp não suportado',
        };
    }
  }

  // Evolution API methods
  private async testEvolutionConnection(): Promise<boolean> {
    if (!this.config?.base_url || !this.config?.api_key) return false;

    try {
      const response = await fetch(`${this.config.base_url}/instance/connectionState/${this.config.session_name}`, {
        headers: {
          'apikey': this.config.api_key,
        },
      });
      
      const data = await response.json();
      return data.instance?.state === 'open';
    } catch (error) {
      console.error('Erro ao testar conexão Evolution:', error);
      return false;
    }
  }

  private async sendEvolutionMessage(phoneNumber: string, message: string): Promise<SendMessageResponse> {
    if (!this.config?.base_url || !this.config?.api_key || !this.config?.session_name) {
      return {
        success: false,
        error: 'Configuração Evolution incompleta',
      };
    }

    try {
      const response = await fetch(`${this.config.base_url}/message/sendText/${this.config.session_name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.api_key,
        },
        body: JSON.stringify({
          number: phoneNumber.replace(/\D/g, ''),
          text: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro ao enviar mensagem',
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem via Evolution:', error);
      return {
        success: false,
        error: 'Erro de conexão com Evolution API',
      };
    }
  }

  private async sendEvolutionMediaMessage(
    phoneNumber: string,
    message: string,
    mediaUrl: string,
    mediaType: string
  ): Promise<SendMessageResponse> {
    if (!this.config?.base_url || !this.config?.api_key || !this.config?.session_name) {
      return {
        success: false,
        error: 'Configuração Evolution incompleta',
      };
    }

    try {
      const response = await fetch(`${this.config.base_url}/message/sendMedia/${this.config.session_name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.api_key,
        },
        body: JSON.stringify({
          number: phoneNumber.replace(/\D/g, ''),
          media: mediaUrl,
          caption: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro ao enviar mídia',
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
      };
    } catch (error) {
      console.error('Erro ao enviar mídia via Evolution:', error);
      return {
        success: false,
        error: 'Erro de conexão com Evolution API',
      };
    }
  }

  // Twilio methods
  private async testTwilioConnection(): Promise<boolean> {
    if (!this.config?.account_sid || !this.config?.auth_token) return false;

    try {
      const auth = btoa(`${this.config.account_sid}:${this.config.auth_token}`);
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.account_sid}.json`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Twilio:', error);
      return false;
    }
  }

  private async sendTwilioMessage(phoneNumber: string, message: string): Promise<SendMessageResponse> {
    if (!this.config?.account_sid || !this.config?.auth_token || !this.config?.phone_number) {
      return {
        success: false,
        error: 'Configuração Twilio incompleta',
      };
    }

    try {
      const auth = btoa(`${this.config.account_sid}:${this.config.auth_token}`);
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.account_sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${this.config.phone_number}`,
          To: `whatsapp:${phoneNumber}`,
          Body: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro ao enviar mensagem',
        };
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem via Twilio:', error);
      return {
        success: false,
        error: 'Erro de conexão com Twilio API',
      };
    }
  }

  private async sendTwilioMediaMessage(
    phoneNumber: string,
    message: string,
    mediaUrl: string,
    mediaType: string
  ): Promise<SendMessageResponse> {
    if (!this.config?.account_sid || !this.config?.auth_token || !this.config?.phone_number) {
      return {
        success: false,
        error: 'Configuração Twilio incompleta',
      };
    }

    try {
      const auth = btoa(`${this.config.account_sid}:${this.config.auth_token}`);
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.account_sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${this.config.phone_number}`,
          To: `whatsapp:${phoneNumber}`,
          Body: message,
          MediaUrl: mediaUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro ao enviar mídia',
        };
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error('Erro ao enviar mídia via Twilio:', error);
      return {
        success: false,
        error: 'Erro de conexão com Twilio API',
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
