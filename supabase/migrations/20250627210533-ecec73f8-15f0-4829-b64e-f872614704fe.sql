
-- Limpar TODAS as políticas existentes para garantir um estado limpo
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can view profiles in their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can insert patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can update profiles in their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can delete patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinic staff can view profiles from their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Clinic staff can manage profiles from their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

DROP POLICY IF EXISTS "Clinic users can view their clinic invitations" ON public.patient_invitations;
DROP POLICY IF EXISTS "Clinic users can create invitations" ON public.patient_invitations;
DROP POLICY IF EXISTS "Clinic users can update their clinic invitations" ON public.patient_invitations;
DROP POLICY IF EXISTS "Users can view invitations from their clinic" ON public.patient_invitations;
DROP POLICY IF EXISTS "Clinic staff can manage invitations" ON public.patient_invitations;

DROP POLICY IF EXISTS "Clinic users can view their clinic webhooks" ON public.whatsapp_webhooks;
DROP POLICY IF EXISTS "Users can view webhooks from their clinic" ON public.whatsapp_webhooks;
DROP POLICY IF EXISTS "Clinic staff can manage webhooks" ON public.whatsapp_webhooks;

-- Remover políticas de outras tabelas que podem existir
DROP POLICY IF EXISTS "Users can view flows from their clinic" ON public.flows;
DROP POLICY IF EXISTS "Clinic staff can manage flows" ON public.flows;
DROP POLICY IF EXISTS "Users can view executions from their clinic" ON public.flow_executions;
DROP POLICY IF EXISTS "Clinic staff can manage executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Users can view steps from their executions" ON public.flow_steps;
DROP POLICY IF EXISTS "Clinic staff can manage flow steps" ON public.flow_steps;
DROP POLICY IF EXISTS "Users can view messages from their clinic" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Clinic staff can manage messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Users can view analytics from their clinic" ON public.analytics_events;
DROP POLICY IF EXISTS "All authenticated users can insert analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Clinic admins can manage their clinic" ON public.clinics;

-- Agora criar as políticas de forma organizada
-- ============================================
-- POLÍTICAS PARA PROFILES
-- ============================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_select_clinic_staff" ON public.profiles
  FOR SELECT USING (
    clinic_id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "profiles_select_super_admin" ON public.profiles
  FOR SELECT USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA NOTIFICATIONS
-- ============================================
CREATE POLICY "notifications_own_access" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS PARA PATIENT_INVITATIONS
-- ============================================
CREATE POLICY "invitations_clinic_access" ON public.patient_invitations
  FOR ALL USING (
    clinic_id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "invitations_super_admin_access" ON public.patient_invitations
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA FLOWS
-- ============================================
CREATE POLICY "flows_clinic_access" ON public.flows
  FOR ALL USING (
    clinic_id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "flows_super_admin_access" ON public.flows
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA FLOW_EXECUTIONS
-- ============================================
CREATE POLICY "executions_clinic_access" ON public.flow_executions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = flow_executions.patient_id 
      AND clinic_id = get_current_user_clinic_id()
    ) AND get_current_user_role() = 'clinic'
  );

CREATE POLICY "executions_super_admin_access" ON public.flow_executions
  FOR ALL USING (get_current_user_role() = 'super_admin');

CREATE POLICY "executions_patient_view" ON public.flow_executions
  FOR SELECT USING (
    patient_id = auth.uid() AND 
    get_current_user_role() = 'patient'
  );

-- ============================================
-- POLÍTICAS PARA FLOW_STEPS
-- ============================================
CREATE POLICY "steps_clinic_access" ON public.flow_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.flow_executions fe
      JOIN public.profiles p ON p.user_id = fe.patient_id
      WHERE fe.id = flow_steps.execution_id 
      AND p.clinic_id = get_current_user_clinic_id()
    ) AND get_current_user_role() = 'clinic'
  );

CREATE POLICY "steps_super_admin_access" ON public.flow_steps
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA WHATSAPP_WEBHOOKS
-- ============================================
CREATE POLICY "webhooks_clinic_access" ON public.whatsapp_webhooks
  FOR ALL USING (
    clinic_id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "webhooks_super_admin_access" ON public.whatsapp_webhooks
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA WHATSAPP_MESSAGES
-- ============================================
CREATE POLICY "messages_clinic_access" ON public.whatsapp_messages
  FOR ALL USING (
    clinic_id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "messages_super_admin_access" ON public.whatsapp_messages
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA ANALYTICS_EVENTS
-- ============================================
CREATE POLICY "analytics_insert_authenticated" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_clinic_view" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = analytics_events.user_id 
      AND clinic_id = get_current_user_clinic_id()
    ) AND get_current_user_role() = 'clinic'
  );

CREATE POLICY "analytics_super_admin_access" ON public.analytics_events
  FOR ALL USING (get_current_user_role() = 'super_admin');

-- ============================================
-- POLÍTICAS PARA CLINICS
-- ============================================
CREATE POLICY "clinics_own_access" ON public.clinics
  FOR ALL USING (
    id = get_current_user_clinic_id() AND 
    get_current_user_role() = 'clinic'
  );

CREATE POLICY "clinics_super_admin_access" ON public.clinics
  FOR ALL USING (get_current_user_role() = 'super_admin');
