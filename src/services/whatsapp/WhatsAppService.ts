
import { WhatsAppConfig, WhatsAppMessage, SendMessageResponse, MediaUploadResponse } from './types';

export class WhatsAppService {
  private config: WhatsAppConfig | null = null;

  constructor(config?: WhatsAppConfig) {
    if (config) {
      this.config = config;
    }
  }

  setConfig(config: WhatsAppConfig) {
    this.config = config;
  }

  async sendMessage(to: string, message: string): Promise<SendMessageResponse> {
    if (!this.config || !this.config.active) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      switch (this.config.provider) {
        case 'evolution':
          return await this.sendEvolutionMessage(to, message);
        case 'twilio':
          return await this.sendTwilioMessage(to, message);
        case 'meta':
          return await this.sendMetaMessage(to, message);
        default:
          return { success: false, error: 'Provedor não suportado' };
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async sendMediaMessage(to: string, message: string, mediaUrl: string, mediaType: string): Promise<SendMessageResponse> {
    if (!this.config || !this.config.active) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      switch (this.config.provider) {
        case 'evolution':
          return await this.sendEvolutionMediaMessage(to, message, mediaUrl, mediaType);
        case 'twilio':
          return await this.sendTwilioMediaMessage(to, message, mediaUrl, mediaType);
        case 'meta':
          return await this.sendMetaMediaMessage(to, message, mediaUrl, mediaType);
        default:
          return { success: false, error: 'Provedor não suportado' };
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  private async sendEvolutionMessage(to: string, message: string): Promise<SendMessageResponse> {
    const response = await fetch(`${this.config!.baseUrl}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        session: this.config!.sessionName,
        to: to,
        text: message,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, messageId: data.messageId };
    } else {
      return { success: false, error: data.message || 'Erro ao enviar mensagem' };
    }
  }

  private async sendEvolutionMediaMessage(to: string, message: string, mediaUrl: string, mediaType: string): Promise<SendMessageResponse> {
    const response = await fetch(`${this.config!.baseUrl}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        session: this.config!.sessionName,
        to: to,
        text: message,
        media: {
          url: mediaUrl,
          type: mediaType,
        },
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, messageId: data.messageId };
    } else {
      return { success: false, error: data.message || 'Erro ao enviar mídia' };
    }
  }

  private async sendTwilioMessage(to: string, message: string): Promise<SendMessageResponse> {
    // Implementação Twilio
    return { success: false, error: 'Twilio não implementado ainda' };
  }

  private async sendTwilioMediaMessage(to: string, message: string, mediaUrl: string, mediaType: string): Promise<SendMessageResponse> {
    // Implementação Twilio com mídia
    return { success: false, error: 'Twilio não implementado ainda' };
  }

  private async sendMetaMessage(to: string, message: string): Promise<SendMessageResponse> {
    // Implementação Meta/WhatsApp Business API
    return { success: false, error: 'Meta API não implementado ainda' };
  }

  private async sendMetaMediaMessage(to: string, message: string, mediaUrl: string, mediaType: string): Promise<SendMessageResponse> {
    // Implementação Meta com mídia
    return { success: false, error: 'Meta API não implementado ainda' };
  }

  async testConnection(): Promise<boolean> {
    if (!this.config || !this.config.active) {
      return false;
    }

    try {
      switch (this.config.provider) {
        case 'evolution':
          const response = await fetch(`${this.config.baseUrl}/session/status/${this.config.sessionName}`, {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
            },
          });
          return response.ok;
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
