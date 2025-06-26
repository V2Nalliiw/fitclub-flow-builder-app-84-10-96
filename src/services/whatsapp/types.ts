
export interface WhatsAppConfig {
  provider: 'evolution' | 'twilio' | 'meta';
  baseUrl?: string;
  apiKey?: string;
  sessionName?: string;
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  accessToken?: string;
  businessAccountId?: string;
  webhookUrl?: string;
  active: boolean;
}

export interface WhatsAppMessage {
  id?: string;
  to: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio';
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  formId?: string;
  patientId?: string;
}

export interface WhatsAppContact {
  phoneNumber: string;
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  mediaId?: string;
  mediaUrl?: string;
  error?: string;
}
