
-- Corrigir as políticas RLS para a tabela clinics
-- Primeiro, remover as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Anyone can view active clinics" ON public.clinics;
DROP POLICY IF EXISTS "Clinics can manage their own data" ON public.clinics;
DROP POLICY IF EXISTS "Super admin can manage all clinics" ON public.clinics;

-- Criar função para obter role do usuário atual (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Política para visualizar clínicas ativas (qualquer pessoa autenticada)
CREATE POLICY "Anyone can view active clinics" 
  ON public.clinics 
  FOR SELECT 
  USING (is_active = true);

-- Política para super administradores gerenciarem todas as clínicas
CREATE POLICY "Super admin can manage all clinics" 
  ON public.clinics 
  FOR ALL 
  USING (public.get_current_user_role() = 'super_admin')
  WITH CHECK (public.get_current_user_role() = 'super_admin');

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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'clinic' 
      AND clinic_id = public.clinics.id
    )
  );
