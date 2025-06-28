
-- Remover todas as políticas existentes da tabela profiles para evitar conflitos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can insert patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can update patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can delete patient profiles" ON public.profiles;

-- Políticas de SELECT (visualização)
CREATE POLICY "Super admin can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Clinics can view profiles in their clinic" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'clinic' 
    AND clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Políticas de INSERT (criação)
CREATE POLICY "Super admin can insert any profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clinics can insert patient profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() = 'clinic' 
    AND role = 'patient' 
    AND clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Políticas de UPDATE (atualização)
CREATE POLICY "Super admin can update any profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Clinics can update profiles in their clinic" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() = 'clinic' 
    AND clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Políticas de DELETE (exclusão)
CREATE POLICY "Super admin can delete any profile" 
  ON public.profiles 
  FOR DELETE 
  USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Clinics can delete patient profiles in their clinic" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.get_current_user_role() = 'clinic' 
    AND role = 'patient' 
    AND clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );
