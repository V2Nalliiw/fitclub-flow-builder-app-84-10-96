
-- Primeiro, vamos criar a função auxiliar para obter clinic_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE  
  user_clinic_id UUID;
BEGIN
  SELECT clinic_id INTO user_clinic_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN user_clinic_id;
END;
$$;

-- Agora vamos remover as políticas existentes para flow_assignments
DROP POLICY IF EXISTS "Clinics can view their flow assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Clinics can create flow assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Patients can view their own assignments" ON public.flow_assignments;

-- Habilitar RLS na tabela flow_assignments se não estiver habilitado
ALTER TABLE public.flow_assignments ENABLE ROW LEVEL SECURITY;

-- Política para clínicas visualizarem suas atribuições
CREATE POLICY "Clinics can view their flow assignments" 
  ON public.flow_assignments 
  FOR SELECT 
  USING (
    get_current_user_role() = 'clinic' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = flow_assignments.patient_id 
      AND clinic_id = get_current_user_clinic_id()
    )
  );

-- Política para clínicas criarem atribuições
CREATE POLICY "Clinics can create flow assignments" 
  ON public.flow_assignments 
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() = 'clinic' AND 
    assigned_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = flow_assignments.patient_id 
      AND clinic_id = get_current_user_clinic_id()
    )
  );

-- Política para clínicas atualizarem suas atribuições
CREATE POLICY "Clinics can update their flow assignments" 
  ON public.flow_assignments 
  FOR UPDATE 
  USING (
    get_current_user_role() = 'clinic' AND 
    assigned_by = auth.uid()
  );

-- Política para pacientes visualizarem suas próprias atribuições
CREATE POLICY "Patients can view their own assignments" 
  ON public.flow_assignments 
  FOR SELECT 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Política para pacientes atualizarem suas próprias atribuições (status)
CREATE POLICY "Patients can update their own assignments" 
  ON public.flow_assignments 
  FOR UPDATE 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Política para super_admin gerenciar todas as atribuições
CREATE POLICY "Super admins can manage all flow assignments" 
  ON public.flow_assignments 
  FOR ALL 
  USING (get_current_user_role() = 'super_admin');
