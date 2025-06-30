
-- Corrigir as policies RLS para incluir o role 'clinic' que aparece nos logs
DROP POLICY IF EXISTS "Users can view whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can insert their clinic whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can update their clinic whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can delete their clinic whatsapp settings" ON public.whatsapp_settings;

-- Policy para SELECT - incluir role 'clinic' além de 'admin' e 'professional'
CREATE POLICY "Users can view whatsapp settings" 
  ON public.whatsapp_settings 
  FOR SELECT
  USING (
    -- Super admin pode ver todas
    get_current_user_role() = 'super_admin' OR
    -- Usuários de clínica podem ver suas configurações (incluindo role 'clinic')
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id()) OR
    -- Usuários de clínica podem ver configurações globais (clinic_id IS NULL) como fallback
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id IS NULL)
  );

-- Policy para INSERT - incluir role 'clinic'
CREATE POLICY "Users can insert their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR INSERT
  WITH CHECK (
    -- Super admin pode inserir configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem inserir configurações para sua clínica
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy para UPDATE - incluir role 'clinic'
CREATE POLICY "Users can update their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR UPDATE
  USING (
    -- Super admin pode atualizar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem atualizar suas configurações
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id())
  )
  WITH CHECK (
    -- Super admin pode atualizar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem atualizar suas configurações
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy para DELETE - incluir role 'clinic'
CREATE POLICY "Users can delete their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR DELETE
  USING (
    -- Super admin pode deletar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem deletar suas configurações
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id())
  );
