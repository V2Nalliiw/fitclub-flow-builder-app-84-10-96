
-- Criar tabela dedicada para convites de pacientes
CREATE TABLE public.patient_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela patient_invitations
ALTER TABLE public.patient_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para patient_invitations
CREATE POLICY "Clinics can view their own invitations" 
  ON public.patient_invitations 
  FOR SELECT 
  USING (
    invited_by = auth.uid() OR 
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clinics can create invitations" 
  ON public.patient_invitations 
  FOR INSERT 
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Clinics can update their invitations" 
  ON public.patient_invitations 
  FOR UPDATE 
  USING (
    invited_by = auth.uid() OR 
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clinics can delete their invitations" 
  ON public.patient_invitations 
  FOR DELETE 
  USING (invited_by = auth.uid());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patient_invitations_updated_at 
  BEFORE UPDATE ON public.patient_invitations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para melhor performance
CREATE INDEX idx_patient_invitations_clinic_id ON public.patient_invitations(clinic_id);
CREATE INDEX idx_patient_invitations_email ON public.patient_invitations(email);
CREATE INDEX idx_patient_invitations_token ON public.patient_invitations(invitation_token);
CREATE INDEX idx_patient_invitations_status ON public.patient_invitations(status);

-- Atualizar a constraint de categoria na tabela notifications para incluir 'patient_invite'
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_category_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_category_check 
CHECK (category IN ('system', 'patient', 'flow', 'team', 'patient_invitation', 'patient_invite'));
