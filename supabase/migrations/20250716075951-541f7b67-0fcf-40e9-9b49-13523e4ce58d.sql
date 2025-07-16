-- Criar tabela flow_logs para rastreamento em tempo real
CREATE TABLE public.flow_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flow_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Clínicas podem ver logs de seus pacientes" 
ON public.flow_logs 
FOR SELECT 
USING (
  get_current_user_role() = 'clinic' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = flow_logs.patient_id 
    AND profiles.clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Sistema pode gerenciar todos os logs" 
ON public.flow_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_flow_logs_execution_id ON public.flow_logs(execution_id);
CREATE INDEX idx_flow_logs_patient_id ON public.flow_logs(patient_id);
CREATE INDEX idx_flow_logs_created_at ON public.flow_logs(created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_flow_logs_updated_at
BEFORE UPDATE ON public.flow_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();