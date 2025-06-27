
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('super_admin', 'clinic', 'patient')),
  clinic_id UUID,
  is_chief BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para inserção de perfil (feita automaticamente via trigger)
CREATE POLICY "Enable insert for authenticated users" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar políticas RLS existentes para usar auth.uid() corretamente
DROP POLICY IF EXISTS "Clínicas podem ver seus próprios fluxos" ON public.flows;
DROP POLICY IF EXISTS "Clínicas podem criar fluxos" ON public.flows;
DROP POLICY IF EXISTS "Clínicas podem atualizar seus próprios fluxos" ON public.flows;

CREATE POLICY "Users can view flows they created or own" 
  ON public.flows 
  FOR SELECT 
  USING (created_by = auth.uid() OR clinic_id = auth.uid());

CREATE POLICY "Authenticated users can create flows" 
  ON public.flows 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own flows" 
  ON public.flows 
  FOR UPDATE 
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own flows" 
  ON public.flows 
  FOR DELETE 
  USING (created_by = auth.uid());

-- Atualizar políticas para flow_executions
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias execuções" ON public.flow_executions;
DROP POLICY IF EXISTS "Clínicas podem ver execuções de seus fluxos" ON public.flow_executions;
DROP POLICY IF EXISTS "Sistema pode criar execuções" ON public.flow_executions;
DROP POLICY IF EXISTS "Sistema pode atualizar execuções" ON public.flow_executions;

CREATE POLICY "Users can view their own executions" 
  ON public.flow_executions 
  FOR SELECT 
  USING (patient_id = auth.uid());

CREATE POLICY "Flow creators can view executions of their flows" 
  ON public.flow_executions 
  FOR SELECT 
  USING (
    flow_id IN (
      SELECT id FROM public.flows WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create executions" 
  ON public.flow_executions 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update executions they're involved in" 
  ON public.flow_executions 
  FOR UPDATE 
  USING (
    patient_id = auth.uid() OR 
    flow_id IN (SELECT id FROM public.flows WHERE created_by = auth.uid())
  );

-- Atualizar políticas para flow_steps
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias etapas" ON public.flow_steps;
DROP POLICY IF EXISTS "Sistema pode gerenciar etapas" ON public.flow_steps;

CREATE POLICY "Users can view steps of their executions" 
  ON public.flow_steps 
  FOR SELECT 
  USING (
    execution_id IN (
      SELECT id FROM public.flow_executions 
      WHERE patient_id = auth.uid() OR 
            flow_id IN (SELECT id FROM public.flows WHERE created_by = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can manage flow steps" 
  ON public.flow_steps 
  FOR ALL 
  USING (
    execution_id IN (
      SELECT id FROM public.flow_executions 
      WHERE patient_id = auth.uid() OR 
            flow_id IN (SELECT id FROM public.flows WHERE created_by = auth.uid())
    )
  );

-- Atualizar políticas para form_responses
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias respostas" ON public.form_responses;
DROP POLICY IF EXISTS "Pacientes podem criar suas próprias respostas" ON public.form_responses;

CREATE POLICY "Users can view their own responses" 
  ON public.form_responses 
  FOR SELECT 
  USING (patient_id = auth.uid());

CREATE POLICY "Users can create their own responses" 
  ON public.form_responses 
  FOR INSERT 
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Flow creators can view responses to their flows" 
  ON public.form_responses 
  FOR SELECT 
  USING (
    execution_id IN (
      SELECT id FROM public.flow_executions 
      WHERE flow_id IN (SELECT id FROM public.flows WHERE created_by = auth.uid())
    )
  );

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
