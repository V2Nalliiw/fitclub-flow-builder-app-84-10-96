-- Criar tabela para templates de WhatsApp
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_official BOOLEAN NOT NULL DEFAULT false,
  placeholders TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, clinic_id)
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Templates globais são visíveis para todos" 
ON public.whatsapp_templates 
FOR SELECT 
USING (clinic_id IS NULL);

CREATE POLICY "Clínicas podem ver seus próprios templates" 
ON public.whatsapp_templates 
FOR SELECT 
USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Clínicas podem criar seus próprios templates" 
ON public.whatsapp_templates 
FOR INSERT 
WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Clínicas podem atualizar seus próprios templates" 
ON public.whatsapp_templates 
FOR UPDATE 
USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Clínicas podem deletar seus próprios templates" 
ON public.whatsapp_templates 
FOR DELETE 
USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Super admins podem gerenciar templates globais" 
ON public.whatsapp_templates 
FOR ALL 
USING (get_current_user_role() = 'super_admin' AND clinic_id IS NULL)
WITH CHECK (get_current_user_role() = 'super_admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_templates_updated_at 
BEFORE UPDATE ON public.whatsapp_templates 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_whatsapp_templates_name ON public.whatsapp_templates(name);
CREATE INDEX idx_whatsapp_templates_clinic_id ON public.whatsapp_templates(clinic_id);
CREATE INDEX idx_whatsapp_templates_active ON public.whatsapp_templates(is_active);

-- Inserir template padrão de código de verificação
INSERT INTO public.whatsapp_templates (name, content, placeholders, is_official)
VALUES (
  'codigo_verificacao',
  '🔐 *Código de Verificação {clinic_name}*

Seu código de verificação é: *{code}*

Este código expira em {expiry_time}.

_Não compartilhe este código com ninguém._',
  ARRAY['code', 'clinic_name', 'expiry_time'],
  false
);

-- Template padrão para envio de formulários
INSERT INTO public.whatsapp_templates (name, content, placeholders, is_official)
VALUES (
  'envio_formulario',
  '📋 *{form_name}*

Olá {patient_name}! Você tem um formulário para preencher.

🔗 Acesse o link: {form_url}

_Responda assim que possível._',
  ARRAY['form_name', 'patient_name', 'form_url'],
  false
);

-- Template padrão para mensagens gerais
INSERT INTO public.whatsapp_templates (name, content, placeholders, is_official)
VALUES (
  'mensagem_geral',
  '💬 *Mensagem de {clinic_name}*

{message}

_Atenciosamente, {clinic_name}_',
  ARRAY['clinic_name', 'message'],
  false
);