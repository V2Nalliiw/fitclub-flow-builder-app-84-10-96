
-- Criar política RLS para permitir que clínicas vejam pacientes disponíveis para convite
CREATE POLICY "Clinics can view available patients for invitation" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'clinic' 
    AND role = 'patient' 
    AND clinic_id IS NULL
  );

-- Verificar se a política foi criada corretamente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Clinics can view available patients for invitation';
