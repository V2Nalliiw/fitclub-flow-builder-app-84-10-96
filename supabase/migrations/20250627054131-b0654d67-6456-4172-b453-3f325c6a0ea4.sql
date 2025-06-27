
-- Criar tabela para fluxos
CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  clinic_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para execuções de fluxos
CREATE TABLE public.flow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE NOT NULL,
  flow_name TEXT NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('em-andamento', 'pausado', 'concluido', 'aguardando')),
  current_node TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_step_available_at TIMESTAMP WITH TIME ZONE,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  current_step JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para etapas de fluxos
CREATE TABLE public.flow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID REFERENCES public.flow_executions(id) ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'disponivel', 'concluido', 'aguardando')),
  completed_at TIMESTAMP WITH TIME ZONE,
  available_at TIMESTAMP WITH TIME ZONE,
  form_url TEXT,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para respostas de formulários
CREATE TABLE public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID REFERENCES public.flow_executions(id) ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para flows
CREATE POLICY "Clínicas podem ver seus próprios fluxos" 
  ON public.flows 
  FOR SELECT 
  USING (created_by = auth.uid() OR clinic_id = auth.uid());

CREATE POLICY "Clínicas podem criar fluxos" 
  ON public.flows 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Clínicas podem atualizar seus próprios fluxos" 
  ON public.flows 
  FOR UPDATE 
  USING (created_by = auth.uid() OR clinic_id = auth.uid());

-- Políticas RLS para flow_executions
CREATE POLICY "Pacientes podem ver suas próprias execuções" 
  ON public.flow_executions 
  FOR SELECT 
  USING (patient_id = auth.uid());

CREATE POLICY "Clínicas podem ver execuções de seus fluxos" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    flow_id IN (
      SELECT id FROM public.flows 
      WHERE created_by = auth.uid() OR clinic_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode criar execuções" 
  ON public.flow_executions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar execuções" 
  ON public.flow_executions 
  FOR UPDATE 
  USING (true);

-- Políticas RLS para flow_steps
CREATE POLICY "Pacientes podem ver suas próprias etapas" 
  ON public.flow_steps 
  FOR SELECT 
  USING (
    execution_id IN (
      SELECT id FROM public.flow_executions 
      WHERE patient_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode gerenciar etapas" 
  ON public.flow_steps 
  FOR ALL 
  USING (true);

-- Políticas RLS para form_responses
CREATE POLICY "Pacientes podem ver suas próprias respostas" 
  ON public.form_responses 
  FOR SELECT 
  USING (patient_id = auth.uid());

CREATE POLICY "Pacientes podem criar suas próprias respostas" 
  ON public.form_responses 
  FOR INSERT 
  WITH CHECK (patient_id = auth.uid());

-- Criar índices para melhor performance
CREATE INDEX idx_flow_executions_patient_id ON public.flow_executions(patient_id);
CREATE INDEX idx_flow_executions_flow_id ON public.flow_executions(flow_id);
CREATE INDEX idx_flow_executions_status ON public.flow_executions(status);
CREATE INDEX idx_flow_steps_execution_id ON public.flow_steps(execution_id);
CREATE INDEX idx_form_responses_execution_id ON public.form_responses(execution_id);
CREATE INDEX idx_form_responses_patient_id ON public.form_responses(patient_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_flows_updated_at 
  BEFORE UPDATE ON public.flows 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flow_executions_updated_at 
  BEFORE UPDATE ON public.flow_executions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flow_steps_updated_at 
  BEFORE UPDATE ON public.flow_steps 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
