
-- Atualizar a policy para permitir que pacientes vejam as configurações do WhatsApp (somente leitura)
DROP POLICY IF EXISTS "Users can view whatsapp settings" ON public.whatsapp_settings;

-- Nova policy que permite pacientes visualizarem as configurações (mas não editarem)
CREATE POLICY "Users can view whatsapp settings" 
  ON public.whatsapp_settings 
  FOR SELECT
  USING (
    -- Super admin pode ver todas
    get_current_user_role() = 'super_admin' OR
    -- Usuários de clínica (admin, professional, clinic) podem ver suas configurações
    (get_current_user_role() IN ('admin', 'professional', 'clinic') AND clinic_id = get_current_user_clinic_id()) OR
    -- PACIENTES podem ver configurações da sua clínica para verificação do WhatsApp
    (get_current_user_role() = 'patient' AND clinic_id = get_current_user_clinic_id()) OR
    -- Usuários (incluindo pacientes) podem ver configurações globais (clinic_id IS NULL) como fallback
    (get_current_user_role() IN ('admin', 'professional', 'clinic', 'patient') AND clinic_id IS NULL)
  );
