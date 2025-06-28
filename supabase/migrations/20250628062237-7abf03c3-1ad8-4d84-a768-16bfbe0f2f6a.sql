
-- Create missing tables that the code expects

-- Create clinics table
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Create policies for clinics
CREATE POLICY "Super admins can view all clinics" ON public.clinics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Users can view their clinic" ON public.clinics
  FOR SELECT USING (
    id IN (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Create analytics_events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Users can view relevant analytics" ON public.analytics_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Users can insert their own events" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update profiles table to add foreign key to clinics
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);
