
-- Create dedicated WhatsApp settings table
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('evolution', 'meta', 'twilio')),
  base_url TEXT,
  api_key TEXT,
  session_name TEXT,
  account_sid TEXT,
  auth_token TEXT,
  phone_number TEXT,
  access_token TEXT,
  business_account_id TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id) -- Allows only one setting per clinic, null clinic_id for global settings
);

-- Enable RLS for WhatsApp settings
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Policy for Super Admin to manage global settings (clinic_id IS NULL)
CREATE POLICY "Super admin can manage global whatsapp settings" 
  ON public.whatsapp_settings 
  FOR ALL
  USING (
    get_current_user_role() = 'super_admin'
  );

-- Policy for clinic users to view and manage their clinic settings
CREATE POLICY "Users can manage their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR ALL
  USING (
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id()) OR
    get_current_user_role() = 'super_admin'
  );

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing settings from notifications table if any exist
INSERT INTO public.whatsapp_settings (
  clinic_id,
  provider,
  base_url,
  api_key,
  session_name,
  account_sid,
  auth_token,
  phone_number,
  access_token,
  business_account_id,
  webhook_url,
  is_active
)
SELECT 
  (metadata->>'clinic_id')::uuid,
  COALESCE(metadata->>'provider', 'evolution'),
  metadata->>'base_url',
  metadata->>'api_key',
  metadata->>'session_name',
  metadata->>'account_sid',
  metadata->>'auth_token',
  metadata->>'phone_number',
  metadata->>'access_token',
  metadata->>'business_account_id',
  metadata->>'webhook_url',
  COALESCE((metadata->>'is_active')::boolean, false)
FROM public.notifications 
WHERE category = 'whatsapp_settings'
ON CONFLICT (clinic_id) DO NOTHING;
