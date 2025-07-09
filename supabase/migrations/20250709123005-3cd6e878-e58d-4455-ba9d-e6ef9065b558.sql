-- Criar tabela para gerenciar acesso a conteúdos com tokens seguros
CREATE TABLE public.content_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  access_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Patients can view their own content access" 
ON public.content_access 
FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Clinics can create content access for their patients" 
ON public.content_access 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = 'clinic' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = content_access.patient_id 
    AND clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Clinics can view content access for their patients" 
ON public.content_access 
FOR SELECT 
USING (
  get_current_user_role() = 'clinic' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = content_access.patient_id 
    AND clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Super admins can manage all content access" 
ON public.content_access 
FOR ALL 
USING (get_current_user_role() = 'super_admin');

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_content_access_updated_at
BEFORE UPDATE ON public.content_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para performance
CREATE INDEX idx_content_access_execution_id ON public.content_access(execution_id);
CREATE INDEX idx_content_access_patient_id ON public.content_access(patient_id);
CREATE INDEX idx_content_access_token ON public.content_access(access_token);
CREATE INDEX idx_content_access_expires_at ON public.content_access(expires_at);