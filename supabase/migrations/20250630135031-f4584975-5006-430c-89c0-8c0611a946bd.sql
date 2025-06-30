
-- Habilitar RLS na tabela flow_executions se não estiver habilitado
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Patients can create their own executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Patients can view their own executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Patients can update their own executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Clinics can view executions of their flows" ON public.flow_executions;
DROP POLICY IF EXISTS "Super admins can view all executions" ON public.flow_executions;

-- Política para pacientes criarem suas próprias execuções
CREATE POLICY "Patients can create their own executions" 
  ON public.flow_executions 
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Política para pacientes visualizarem suas próprias execuções
CREATE POLICY "Patients can view their own executions" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Política para pacientes atualizarem suas próprias execuções
CREATE POLICY "Patients can update their own executions" 
  ON public.flow_executions 
  FOR UPDATE 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Política para clínicas visualizarem execuções de seus fluxos
CREATE POLICY "Clinics can view executions of their flows" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    get_current_user_role() = 'clinic' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = flow_executions.patient_id 
      AND clinic_id = get_current_user_clinic_id()
    )
  );

-- Política para super_admin gerenciar todas as execuções
CREATE POLICY "Super admins can manage all executions" 
  ON public.flow_executions 
  FOR ALL 
  USING (get_current_user_role() = 'super_admin');
