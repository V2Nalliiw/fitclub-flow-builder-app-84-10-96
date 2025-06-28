
-- Adicionar políticas RLS para a tabela notifications
-- Política para permitir que usuários vejam suas próprias notificações
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política para permitir que usuários insiram suas próprias notificações
CREATE POLICY "Users can insert their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Política para permitir que usuários atualizem suas próprias notificações
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Política para permitir que usuários deletem suas próprias notificações
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Política para permitir que clínicas vejam notificações de convites que criaram
CREATE POLICY "Clinics can view patient invitation notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    category = 'patient_invitation' AND 
    metadata->>'clinic_id' = (SELECT clinic_id::text FROM public.profiles WHERE user_id = auth.uid())
  );

-- Política para permitir que clínicas criem convites de pacientes
CREATE POLICY "Clinics can create patient invitation notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    category = 'patient_invitation' AND 
    user_id = auth.uid() AND
    public.get_current_user_role() = 'clinic'
  );

-- Habilitar RLS na tabela notifications se ainda não estiver habilitado
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
