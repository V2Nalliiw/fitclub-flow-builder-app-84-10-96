
-- Primeiro, vamos remover todas as políticas existentes que estão causando recursão
DROP POLICY IF EXISTS "Clinics can view their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can create flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can update their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can delete their own flows" ON public.flows;
DROP POLICY IF EXISTS "Super admins can manage all flows" ON public.flows;
DROP POLICY IF EXISTS "Patients can view assigned flows" ON public.flows;

DROP POLICY IF EXISTS "Clinics can view their flow assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Clinics can create flow assignments" ON public.flow_assignments;
DROP POLICY IF EXISTS "Patients can view their own assignments" ON public.flow_assignments;

DROP POLICY IF EXISTS "Patients can view their own executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Clinics can view executions of their flows" ON public.flow_executions;
DROP POLICY IF EXISTS "Super admins can view all executions" ON public.flow_executions;

-- Agora vamos criar políticas simples e diretas sem recursão
-- Políticas para flows
CREATE POLICY "flows_select_clinic" ON public.flows
  FOR SELECT USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "flows_insert_clinic" ON public.flows
  FOR INSERT WITH CHECK (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "flows_update_clinic" ON public.flows
  FOR UPDATE USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "flows_delete_clinic" ON public.flows
  FOR DELETE USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_current_user_clinic_id()
  );

CREATE POLICY "flows_super_admin" ON public.flows
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- Políticas para flow_assignments
CREATE POLICY "flow_assignments_clinic" ON public.flow_assignments
  FOR ALL USING (
    get_current_user_role() = 'clinic' AND 
    assigned_by = auth.uid()
  );

CREATE POLICY "flow_assignments_patient" ON public.flow_assignments
  FOR SELECT USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

-- Políticas para flow_executions
CREATE POLICY "flow_executions_patient" ON public.flow_executions
  FOR SELECT USING (
    get_current_user_role() = 'patient' AND 
    patient_id = auth.uid()
  );

CREATE POLICY "flow_executions_clinic" ON public.flow_executions
  FOR ALL USING (
    get_current_user_role() = 'clinic' AND 
    flow_id IN (
      SELECT id FROM public.flows 
      WHERE clinic_id = get_current_user_clinic_id()
    )
  );

CREATE POLICY "flow_executions_super_admin" ON public.flow_executions
  FOR ALL USING (get_current_user_role() = 'super_admin');
