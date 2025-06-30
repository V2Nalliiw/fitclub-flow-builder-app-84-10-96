
export interface WhatsAppConfig {
  provider: 'evolution' | 'meta' | 'twilio';
  base_url?: string;
  api_key?: string;
  session_name?: string;
  account_sid?: string;
  auth_token?: string;
  phone_number?: string;
  access_token?: string;
  business_account_id?: string;
  webhook_url?: string;
  is_active: boolean;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  response?: any;
}

export interface MediaUploadResponse extends SendMessageResponse {
  mediaId?: string;
  mediaUrl?: string;
}

export interface TemplateMessage {
  name: string;
  language: string;
  parameters?: string[];
}

export interface BusinessProfile {
  id: string;
  name: string;
  phone_numbers?: any[];
}

export interface PhoneNumberInfo {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
}
