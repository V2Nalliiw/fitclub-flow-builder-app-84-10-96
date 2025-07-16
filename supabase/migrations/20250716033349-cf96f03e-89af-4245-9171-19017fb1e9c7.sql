-- Criar tabela para processar delays em background
CREATE TABLE IF NOT EXISTS public.delay_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES flow_executions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  next_node_id TEXT NOT NULL,
  next_node_type TEXT NOT NULL,
  form_name TEXT NOT NULL,
  trigger_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Habilitar RLS
ALTER TABLE public.delay_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Clínicas podem ver tasks de seus pacientes" 
ON public.delay_tasks 
FOR SELECT 
USING (
  get_current_user_role() = 'clinic' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = delay_tasks.patient_id 
    AND clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Sistema pode gerenciar delay tasks"
ON public.delay_tasks
FOR ALL
USING (true)
WITH CHECK (true);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_delay_tasks_trigger_at ON public.delay_tasks(trigger_at) WHERE NOT processed;