
-- Remover todas as políticas existentes da tabela flows que estão causando recursão
DROP POLICY IF EXISTS "Clinics can view their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can create flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can update their own flows" ON public.flows;
DROP POLICY IF EXISTS "Clinics can delete their own flows" ON public.flows;
DROP POLICY IF EXISTS "Super admins can manage all flows" ON public.flows;
DROP POLICY IF EXISTS "Patients can view assigned flows" ON public.flows;
DROP POLICY IF EXISTS "flows_select_clinic" ON public.flows;
DROP POLICY IF EXISTS "flows_insert_clinic" ON public.flows;
DROP POLICY IF EXISTS "flows_update_clinic" ON public.flows;
DROP POLICY IF EXISTS "flows_delete_clinic" ON public.flows;
DROP POLICY IF EXISTS "flows_super_admin" ON public.flows;

-- Criar políticas simplificadas usando as funções auxiliares existentes
-- Políticas para SELECT (visualização)
CREATE POLICY "flows_clinic_select" ON public.flows
  FOR SELECT USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "flows_super_admin_all" ON public.flows
  FOR ALL USING (get_current_user_role() = 'super_admin');

CREATE POLICY "flows_patient_assigned" ON public.flows
  FOR SELECT USING (
    get_current_user_role() = 'patient' AND 
    id IN (
      SELECT flow_id 
      FROM public.flow_assignments 
      WHERE patient_id = auth.uid()
    )
  );

-- Políticas para INSERT (criação)
CREATE POLICY "flows_clinic_insert" ON public.flows
  FOR INSERT WITH CHECK (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_user_clinic_id() AND
    created_by = auth.uid()
  );

-- Políticas para UPDATE (atualização)
CREATE POLICY "flows_clinic_update" ON public.flows
  FOR UPDATE USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_user_clinic_id() AND
    created_by = auth.uid()
  );

-- Políticas para DELETE (exclusão)
CREATE POLICY "flows_clinic_delete" ON public.flows
  FOR DELETE USING (
    get_current_user_role() = 'clinic' AND 
    clinic_id = get_user_clinic_id() AND
    created_by = auth.uid()
  );
