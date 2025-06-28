
-- Remover políticas duplicadas se existirem e recriar as corretas
DROP POLICY IF EXISTS "Patients can view their own assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Clinics can view their flow assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Clinics can create flow assignments" ON public.flow_assignments;

-- Configurar RLS para a tabela flows (se ainda não estiver habilitado)
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- Políticas para flows - remover se existirem e recriar
DROP POLICY IF EXISTS "Clinics can view their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can create flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can update their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can delete their own flows" ON public.flows;
DROP POLICY IF EXISTS "Super admins can manage all flows" ON public.flows;
DROP POLICY IF EXISTS "Patients can view assigned flows" ON public.flows;

CREATE POLICY "Clinics can view their own flows" 
  ON public.flows 
  FOR SELECT 
  USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "Clinics can create flows" 
  ON public.flows 
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "Clinics can update their own flows" 
  ON public.flows 
  FOR UPDATE 
  USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "Clinics can delete their own flows" 
  ON public.flows 
  FOR DELETE 
  USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "Super admins can manage all flows" 
  ON public.flows 
  FOR ALL 
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Patients can view assigned flows" 
  ON public.flows 
  FOR SELECT 
  USING (
    get_current_user_role() = 'patient' AND 
    id IN (
      SELECT flow_id 
      FROM public.flow_assignments 
      WHERE patient_id = auth.uid()
    )
  );

-- Configurar RLS para flow_assignments
ALTER TABLE public.flow_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can view their flow assignments" 
  ON public.flow_assignments 
  FOR SELECT 
  USING (
    get_current_user_role() = 'clinic' AND 
    assigned_by = auth.uid()
  );

CREATE POLICY "Clinics can create flow assignments" 
  ON public.flow_assignments 
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() = 'clinic' AND 
    assigned_by = auth.uid()
  );

CREATE POLICY "Patients can view their own assignments" 
  ON public.flow_assignments 
  FOR SELECT 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Configurar RLS para flow_executions
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view their own executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Clinics can view executions of their flows" ON public.flow_executions;
DROP POLICY IF EXISTS "Super admins can view all executions" ON public.flow_executions;

CREATE POLICY "Patients can view their own executions" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

CREATE POLICY "Clinics can view executions of their flows" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    get_current_user_role() = 'clinic' AND 
    flow_id IN (
      SELECT id 
      FROM public.flows 
      WHERE clinic_id = get_current_user_clinic_id()
    )
  );

CREATE POLICY "Super admins can view all executions" 
  ON public.flow_executions 
  FOR ALL 
  USING (get_current_user_role() = 'super_admin');
