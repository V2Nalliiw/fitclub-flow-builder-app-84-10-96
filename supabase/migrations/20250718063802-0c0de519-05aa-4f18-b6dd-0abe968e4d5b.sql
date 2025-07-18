-- Criar enum para tipos de permissões/roles
CREATE TYPE public.team_role AS ENUM ('admin', 'manager', 'professional', 'assistant', 'viewer');

-- Criar tabela para membros da equipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  whatsapp_phone TEXT,
  whatsapp_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

-- Criar tabela para convites de equipe
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  whatsapp_phone TEXT,
  invited_by UUID NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies para team_members
CREATE POLICY "Clinics can manage their team members"
ON public.team_members
FOR ALL
USING (clinic_id = get_current_user_clinic_id())
WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Super admins can manage all team members"
ON public.team_members
FOR ALL
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- RLS Policies para team_invitations
CREATE POLICY "Clinics can manage their invitations"
ON public.team_invitations
FOR ALL
USING (clinic_id = get_current_user_clinic_id())
WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Super admins can manage all invitations"
ON public.team_invitations
FOR ALL
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Criar função para verificar permissões de equipe
CREATE OR REPLACE FUNCTION public.has_team_permission(_user_id UUID, _clinic_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.user_id = _user_id 
      AND tm.clinic_id = _clinic_id
      AND tm.is_active = true
      AND (
        tm.role IN ('admin', 'manager') OR
        (tm.permissions->_permission)::boolean = true
      )
  )
$$;

-- Triggers para updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar foreign key constraints
ALTER TABLE public.team_members
ADD CONSTRAINT team_members_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.team_invitations
ADD CONSTRAINT team_invitations_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;