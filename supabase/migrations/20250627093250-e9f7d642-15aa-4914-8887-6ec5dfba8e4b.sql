
-- Fix infinite recursion in RLS policies for profiles table

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can insert patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can update patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can delete patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to get user clinic_id safely
CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple policy: users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Simple policy: users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Simple policy: authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Policy for super_admin to view all profiles
CREATE POLICY "Super admin can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'super_admin');

-- Policy for clinics to view profiles in their clinic
CREATE POLICY "Clinics can view profiles in their clinic" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'clinic' AND 
    clinic_id = public.get_current_user_clinic_id()
  );

-- Policy for clinics to insert patient profiles in their clinic
CREATE POLICY "Clinics can insert patient profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() = 'clinic' AND 
    role = 'patient' AND 
    clinic_id = public.get_current_user_clinic_id()
  );

-- Policy for clinics to update profiles in their clinic
CREATE POLICY "Clinics can update profiles in their clinic" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() = 'clinic' AND 
    clinic_id = public.get_current_user_clinic_id()
  );

-- Policy for clinics to delete patient profiles in their clinic
CREATE POLICY "Clinics can delete patient profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.get_current_user_role() = 'clinic' AND 
    role = 'patient' AND 
    clinic_id = public.get_current_user_clinic_id()
  );
