
-- Atualizar políticas RLS para notifications para permitir que clínicas criem convites para pacientes
-- Primeiro, vamos remover a política existente que pode estar causando conflito
DROP POLICY IF EXISTS "Clinics can create patient invitation notifications" ON public.notifications;

-- Criar nova política que permite clínicas criarem notificações de convite para pacientes
CREATE POLICY "Clinics can create patient invitations" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    category = 'patient_invite' AND 
    public.get_current_user_role() = 'clinic' AND
    -- Verificar se o paciente alvo não tem clínica (está disponível para convite)
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = notifications.user_id 
      AND role = 'patient' 
      AND clinic_id IS NULL
    )
  );

-- Verificar as políticas atuais da tabela notifications
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications' 
ORDER BY policyname;
