
-- Enable RLS on profiles table (caso ainda não esteja habilitado)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can insert patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can update patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can delete patient profiles" ON public.profiles;

-- Policy for users to view profiles based on their role
CREATE POLICY "Users can view profiles based on role" ON public.profiles
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
    WHEN auth.jwt() ->> 'role' = 'patient' THEN user_id = auth.uid()
    ELSE false
  END
);

-- Policy for clinics to insert patient profiles
CREATE POLICY "Clinics can insert patient profiles" ON public.profiles
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'clinic' AND 
  role = 'patient' AND 
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Policy for clinics to update patient profiles
CREATE POLICY "Clinics can update patient profiles" ON public.profiles
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'clinic' AND 
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Policy for clinics to delete patient profiles
CREATE POLICY "Clinics can delete patient profiles" ON public.profiles
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'clinic' AND 
  role = 'patient' AND 
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
);
