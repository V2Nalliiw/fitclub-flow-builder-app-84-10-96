
-- Enable RLS on flows table
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- Policy for users to view flows based on their role
CREATE POLICY "Users can view flows based on role" ON public.flows
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN created_by = auth.uid()
    ELSE false
  END
);

-- Policy for clinics to insert their own flows
CREATE POLICY "Clinics can insert own flows" ON public.flows
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'clinic' AND 
  created_by = auth.uid()
);

-- Policy for clinics to update their own flows
CREATE POLICY "Clinics can update own flows" ON public.flows
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'clinic' AND 
  created_by = auth.uid()
);

-- Policy for clinics to delete their own flows
CREATE POLICY "Clinics can delete own flows" ON public.flows
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'clinic' AND 
  created_by = auth.uid()
);

-- Enable RLS on flow_executions table
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view flow executions based on their role
CREATE POLICY "Users can view flow executions based on role" ON public.flow_executions
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND clinic_id = (
          SELECT clinic_id FROM public.profiles 
          WHERE user_id = patient_id
        )
      )
    WHEN auth.jwt() ->> 'role' = 'patient' THEN patient_id = auth.uid()
    ELSE false
  END
);

-- Policy for clinics to insert flow executions for their patients
CREATE POLICY "Clinics can insert flow executions" ON public.flow_executions
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'clinic' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND clinic_id = (
      SELECT clinic_id FROM public.profiles 
      WHERE user_id = patient_id
    )
  )
);

-- Policy for updating flow executions
CREATE POLICY "Users can update flow executions based on role" ON public.flow_executions
FOR UPDATE USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND clinic_id = (
          SELECT clinic_id FROM public.profiles 
          WHERE user_id = patient_id
        )
      )
    WHEN auth.jwt() ->> 'role' = 'patient' THEN patient_id = auth.uid()
    ELSE false
  END
);

-- Enable RLS on flow_steps table
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;

-- Policy for users to view flow steps based on their role
CREATE POLICY "Users can view flow steps based on role" ON public.flow_steps
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN 
      EXISTS (
        SELECT 1 FROM public.flow_executions fe
        JOIN public.profiles p ON fe.patient_id = p.user_id
        WHERE fe.id = execution_id 
        AND p.clinic_id = (
          SELECT clinic_id FROM public.profiles 
          WHERE user_id = auth.uid()
        )
      )
    WHEN auth.jwt() ->> 'role' = 'patient' THEN 
      EXISTS (
        SELECT 1 FROM public.flow_executions 
        WHERE id = execution_id AND patient_id = auth.uid()
      )
    ELSE false
  END
);

-- Policy for inserting flow steps
CREATE POLICY "System can insert flow steps" ON public.flow_steps
FOR INSERT WITH CHECK (true);

-- Policy for updating flow steps
CREATE POLICY "Users can update flow steps based on role" ON public.flow_steps
FOR UPDATE USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN 
      EXISTS (
        SELECT 1 FROM public.flow_executions fe
        JOIN public.profiles p ON fe.patient_id = p.user_id
        WHERE fe.id = execution_id 
        AND p.clinic_id = (
          SELECT clinic_id FROM public.profiles 
          WHERE user_id = auth.uid()
        )
      )
    WHEN auth.jwt() ->> 'role' = 'patient' THEN 
      EXISTS (
        SELECT 1 FROM public.flow_executions 
        WHERE id = execution_id AND patient_id = auth.uid()
      )
    ELSE false
  END
);

-- Enable RLS on form_responses table
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Policy for users to view form responses based on their role
CREATE POLICY "Users can view form responses based on role" ON public.form_responses
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'clinic' THEN 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND clinic_id = (
          SELECT clinic_id FROM public.profiles 
          WHERE user_id = patient_id
        )
      )
    WHEN auth.jwt() ->> 'role' = 'patient' THEN patient_id = auth.uid()
    ELSE false
  END
);

-- Policy for inserting form responses
CREATE POLICY "Patients can insert own form responses" ON public.form_responses
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'patient' AND 
  patient_id = auth.uid()
);
