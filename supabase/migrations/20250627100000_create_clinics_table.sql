
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

-- Adicionar foreign key para clinic_id na tabela profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;

-- Criar dados de exemplo para clínicas
INSERT INTO public.clinics (name, slug, description, contact_email, contact_phone, is_active) VALUES
('Clínica Saúde Total', 'saude-total', 'Clínica especializada em medicina preventiva e tratamentos integrais', 'contato@saudetotal.com', '(11) 3333-4444', true),
('Centro Médico Vida', 'centro-vida', 'Centro médico com foco em medicina familiar e especialidades', 'info@centrovida.com', '(11) 2222-3333', true),
('Clínica Bem Estar', 'bem-estar', 'Clínica de medicina estética e tratamentos de bem-estar', 'contato@bemestar.com', '(11) 1111-2222', true);

-- Atualizar perfis existentes com clinic_id (assumindo que há perfis sem clinic_id)
UPDATE public.profiles 
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'saude-total' LIMIT 1)
WHERE role = 'clinic' AND clinic_id IS NULL;

-- Adicionar RLS para tabela clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Política para visualizar clínicas ativas
CREATE POLICY "Anyone can view active clinics" 
  ON public.clinics 
  FOR SELECT 
  USING (is_active = true);

-- Política para clínicas gerenciarem seus próprios dados
CREATE POLICY "Clinics can manage their own data" 
  ON public.clinics 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'clinic' 
      AND clinic_id = public.clinics.id
    )
  );

-- Política para super_admin gerenciar todas as clínicas
CREATE POLICY "Super admin can manage all clinics" 
  ON public.clinics 
  FOR ALL 
  USING (public.get_current_user_role() = 'super_admin');

-- Criar trigger para atualizar updated_at na tabela clinics
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_clinics_slug ON public.clinics(slug);
CREATE INDEX idx_clinics_active ON public.clinics(is_active);
