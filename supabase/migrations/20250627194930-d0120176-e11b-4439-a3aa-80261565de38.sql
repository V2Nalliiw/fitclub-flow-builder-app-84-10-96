
-- Criar tabela de clínicas
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS na tabela de clínicas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Política para super_admin ver todas as clínicas
CREATE POLICY "Super admin can view all clinics" 
  ON public.clinics 
  FOR SELECT 
  USING (get_current_user_role() = 'super_admin');

-- Política para admin/professional ver apenas sua clínica
CREATE POLICY "Users can view their clinic" 
  ON public.clinics 
  FOR SELECT 
  USING (
    get_current_user_role() IN ('admin', 'professional') 
    AND id = get_current_user_clinic_id()
  );

-- Política para super_admin criar clínicas
CREATE POLICY "Super admin can create clinics" 
  ON public.clinics 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'super_admin');

-- Política para super_admin atualizar clínicas
CREATE POLICY "Super admin can update clinics" 
  ON public.clinics 
  FOR UPDATE 
  USING (get_current_user_role() = 'super_admin');

-- Política para super_admin deletar clínicas
CREATE POLICY "Super admin can delete clinics" 
  ON public.clinics 
  FOR DELETE 
  USING (get_current_user_role() = 'super_admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais de exemplo
INSERT INTO public.clinics (name, slug, description, contact_email, contact_phone, address) VALUES
('Clínica Saúde Total', 'saude-total', 'Clínica especializada em medicina preventiva', 'contato@saudetotal.com', '(11) 3333-4444', 'Rua das Flores, 123 - São Paulo, SP'),
('Centro Médico Vida', 'centro-vida', 'Centro médico com foco em medicina familiar', 'info@centrovida.com', '(11) 2222-3333', 'Av. Paulista, 456 - São Paulo, SP'),
('Clínica Bem Estar', 'bem-estar', 'Especializada em tratamentos de bem-estar e qualidade de vida', 'contato@bemestar.com', '(11) 1111-2222', 'Rua da Saúde, 789 - São Paulo, SP');

-- Configurar WhatsApp settings table
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('evolution', 'meta', 'twilio')),
  base_url TEXT,
  api_key TEXT,
  session_name TEXT,
  account_sid TEXT,
  auth_token TEXT,
  phone_number TEXT,
  access_token TEXT,
  business_account_id TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id)
);

-- RLS para WhatsApp settings
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Política para ver configurações da própria clínica
CREATE POLICY "Users can view their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR SELECT 
  USING (
    clinic_id = get_current_user_clinic_id() 
    OR get_current_user_role() = 'super_admin'
  );

-- Política para atualizar configurações da própria clínica
CREATE POLICY "Users can update their clinic whatsapp settings" 
  ON public.whatsapp_settings 
  FOR ALL
  USING (
    clinic_id = get_current_user_clinic_id() 
    OR get_current_user_role() = 'super_admin'
  );

-- Trigger para WhatsApp settings
CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mensagens WhatsApp table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES public.flow_executions(id) ON DELETE SET NULL,
  to_phone TEXT NOT NULL,
  message_text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para mensagens WhatsApp
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Política para ver mensagens da própria clínica
CREATE POLICY "Users can view their clinic whatsapp messages" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (
    clinic_id = get_current_user_clinic_id() 
    OR get_current_user_role() = 'super_admin'
  );

-- Trigger para mensagens WhatsApp
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
