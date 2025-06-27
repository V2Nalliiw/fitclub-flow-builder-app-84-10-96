
-- Criar tabela de convites para pacientes
CREATE TABLE public.patient_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para convites
ALTER TABLE public.patient_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para convites
CREATE POLICY "Clinic users can view their clinic invitations" 
  ON public.patient_invitations 
  FOR SELECT 
  USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Clinic users can create invitations" 
  ON public.patient_invitations 
  FOR INSERT 
  WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Clinic users can update their clinic invitations" 
  ON public.patient_invitations 
  FOR UPDATE 
  USING (clinic_id = get_current_user_clinic_id());

-- Criar tabela de webhooks do WhatsApp
CREATE TABLE public.whatsapp_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  webhook_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message_data JSONB NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para webhooks
ALTER TABLE public.whatsapp_webhooks ENABLE ROW LEVEL SECURITY;

-- Política para webhooks
CREATE POLICY "Clinic users can view their clinic webhooks" 
  ON public.whatsapp_webhooks 
  FOR SELECT 
  USING (clinic_id = get_current_user_clinic_id());

-- Adicionar colunas para melhorar execução de fluxos
ALTER TABLE public.flow_executions 
ADD COLUMN IF NOT EXISTS execution_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patient_invitations_clinic_id ON public.patient_invitations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_token ON public.patient_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_status ON public.patient_invitations(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_webhooks_clinic_id ON public.whatsapp_webhooks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_webhooks_phone ON public.whatsapp_webhooks(phone_number);
CREATE INDEX IF NOT EXISTS idx_flow_executions_scheduled ON public.flow_executions(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Trigger para atualizar updated_at em convites
CREATE TRIGGER update_patient_invitations_updated_at
  BEFORE UPDATE ON public.patient_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar realtime para notificações
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Habilitar realtime para execuções de fluxo
ALTER TABLE public.flow_executions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_executions;

-- Habilitar realtime para webhooks do WhatsApp
ALTER TABLE public.whatsapp_webhooks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_webhooks;
