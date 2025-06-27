
-- Criar bucket para logos das clínicas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-logos',
  'clinic-logos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Criar bucket para mídias gerais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav', 'application/pdf', 'text/plain', 'text/csv']
);

-- Criar políticas RLS para bucket de logos das clínicas
CREATE POLICY "Clinics can upload their logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'clinic-logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Anyone can view clinic logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'clinic-logos');

CREATE POLICY "Clinics can update their logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'clinic-logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Clinics can delete their logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'clinic-logos' AND
    auth.uid() IS NOT NULL
  );

-- Criar políticas RLS para bucket de mídias gerais
CREATE POLICY "Users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-files' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-files');

CREATE POLICY "Users can update their media files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media-files' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media-files' AND
    auth.uid() IS NOT NULL
  );
