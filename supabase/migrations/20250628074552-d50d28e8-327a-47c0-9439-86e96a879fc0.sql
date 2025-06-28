
-- Remover todas as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can view profiles in their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can insert patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can update profiles in their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can delete patient profiles in their clinic" ON public.profiles;

-- Criar função auxiliar para obter dados do usuário atual sem recursão
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID AS $$
DECLARE
  user_clinic_id UUID;
BEGIN
  SELECT clinic_id INTO user_clinic_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN user_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
    AND clinic_id = public.get_user_clinic_id()
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
    AND clinic_id = public.get_user_clinic_id()
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
    AND clinic_id = public.get_user_clinic_id()
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
    AND clinic_id = public.get_user_clinic_id()
  );
