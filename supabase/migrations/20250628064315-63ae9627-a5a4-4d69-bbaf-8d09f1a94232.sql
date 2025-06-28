
-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Criar bucket para logo do app (apenas super admin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-logo',
  'app-logo',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para bucket de avatares de usuários
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas RLS para bucket de logo do app
CREATE POLICY "Super admins can upload app logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-logo' AND
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Anyone can view app logo" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-logo');

CREATE POLICY "Super admins can update app logo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'app-logo' AND
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can delete app logo" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'app-logo' AND
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Criar tabela para configurações do app
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  app_name TEXT DEFAULT 'FitClub',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração inicial se não existir
INSERT INTO public.app_settings (app_name) 
SELECT 'FitClub' 
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- RLS para app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Super admins can manage app settings'
  ) THEN
    CREATE POLICY "Super admins can manage app settings" ON public.app_settings
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Everyone can view app settings'
  ) THEN
    CREATE POLICY "Everyone can view app settings" ON public.app_settings
      FOR SELECT USING (true);
  END IF;
END $$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
