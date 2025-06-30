
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Super admin can manage global whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can manage their clinic whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Clinic users can insert their own settings" ON public.whatsapp_settings;

-- Policy for Super Admin to manage global settings (clinic_id IS NULL)
CREATE POLICY "Super admin can manage global whatsapp settings" 
  ON public.whatsapp_settings 
  FOR ALL
  USING (
    get_current_user_role() = 'super_admin'
  )
  WITH CHECK (
    get_current_user_role() = 'super_admin'
  );

-- Policy for clinic users to SELECT their clinic settings or global settings
CREATE POLICY "Users can view whatsapp settings" 
  ON public.whatsapp_settings 
  FOR SELECT
  USING (
    -- Super admin can see all
    get_current_user_role() = 'super_admin' OR
    -- Clinic users can see their clinic settings
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id()) OR
    -- Clinic users can see global settings (clinic_id IS NULL) as fallback
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id IS NULL)
  );

-- Policy for clinic users to INSERT their own settings
CREATE POLICY "Users can insert their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR INSERT
  WITH CHECK (
    -- Super admin can insert global settings
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Clinic users can insert settings for their clinic
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy for clinic users to UPDATE their own settings
CREATE POLICY "Users can update their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR UPDATE
  USING (
    -- Super admin can update global settings
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Clinic users can update their clinic settings
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  )
  WITH CHECK (
    -- Super admin can update global settings
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Clinic users can update their clinic settings
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy for deleting settings
CREATE POLICY "Users can delete their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR DELETE
  USING (
    -- Super admin can delete global settings
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Clinic users can delete their clinic settings
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );
