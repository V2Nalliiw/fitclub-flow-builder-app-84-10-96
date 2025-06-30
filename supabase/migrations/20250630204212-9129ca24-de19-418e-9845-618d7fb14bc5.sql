
-- Corrigir policies RLS para permitir que clínicas salvem suas configurações
DROP POLICY IF EXISTS "Users can insert their clinic whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can update their clinic whatsapp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Users can delete their clinic whatsapp settings" ON public.whatsapp_settings;

-- Policy para INSERT - permitir que clínicas criem suas configurações
CREATE POLICY "Users can insert their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR INSERT
  WITH CHECK (
    -- Super admin pode inserir configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem inserir configurações para sua clínica
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy para UPDATE - permitir que clínicas atualizem suas configurações
CREATE POLICY "Users can update their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR UPDATE
  USING (
    -- Super admin pode atualizar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem atualizar suas configurações
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  )
  WITH CHECK (
    -- Super admin pode atualizar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem atualizar suas configurações
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );

-- Policy para DELETE - permitir que clínicas deletem suas configurações
CREATE POLICY "Users can delete their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR DELETE
  USING (
    -- Super admin pode deletar configurações globais
    (get_current_user_role() = 'super_admin' AND clinic_id IS NULL) OR
    -- Usuários de clínica podem deletar suas configurações
    (get_current_user_role() IN ('admin', 'professional') AND clinic_id = get_current_user_clinic_id())
  );
