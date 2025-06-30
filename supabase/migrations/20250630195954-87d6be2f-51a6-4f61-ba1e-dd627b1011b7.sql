
-- Fix RLS policies for whatsapp_settings table
DROP POLICY IF EXISTS "Super admin can manage global whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can manage their clinic whatsapp settings" ON public.whatsapp_settings;

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
    get_current_user_role() = 'super_admin' OR
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id IS NULL)
  );

-- Allow clinic users to insert new settings for their clinic
CREATE POLICY "Clinic users can insert their own settings" 
  ON public.whatsapp_settings 
  FOR INSERT
  WITH CHECK (
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id()) OR
    get_current_user_role() = 'super_admin'
  );
