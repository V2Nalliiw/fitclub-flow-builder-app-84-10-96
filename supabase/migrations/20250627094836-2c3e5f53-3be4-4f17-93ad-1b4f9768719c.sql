
-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv']
);

-- Create RLS policies for storage bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create analytics table for real data tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analytics table
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics
CREATE POLICY "Users can view their own analytics" ON public.analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create table for flow assignments to patients
CREATE TABLE public.flow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(flow_id, patient_id)
);

-- Enable RLS on flow assignments
ALTER TABLE public.flow_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flow assignments
CREATE POLICY "Clinics can manage assignments for their patients" ON public.flow_assignments
  FOR ALL USING (
    public.get_current_user_role() = 'clinic' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = patient_id 
      AND p.clinic_id = public.get_current_user_clinic_id()
    )
  );

CREATE POLICY "Patients can view their own assignments" ON public.flow_assignments
  FOR SELECT USING (
    public.get_current_user_role() = 'patient' AND
    patient_id = auth.uid()
  );

CREATE POLICY "Super admin can manage all assignments" ON public.flow_assignments
  FOR ALL USING (public.get_current_user_role() = 'super_admin');
