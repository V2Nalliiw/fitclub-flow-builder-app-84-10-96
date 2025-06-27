
export interface WhatsAppConfig {
  provider: 'evolution' | 'twilio' | 'meta';
  base_url?: string;
  api_key?: string;
  session_name?: string;
  account_sid?: string;
  auth_token?: string;
  phone_number?: string;
  access_token?: string;
  business_account_id?: string;
  webhook_url?: string;
  is_active?: boolean;
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
