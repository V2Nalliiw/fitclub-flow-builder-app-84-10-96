
-- Criar bucket para documentos do fluxo (PDFs, imagens, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flow-documents',
  'flow-documents',
  true,
  104857600, -- 100MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg', 'text/plain']
);

-- Criar políticas RLS para bucket de documentos
CREATE POLICY "Users can view flow documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'flow-documents');

CREATE POLICY "Clinics can upload flow documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'flow-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Clinics can update flow documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'flow-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Clinics can delete flow documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'flow-documents' AND
    auth.uid() IS NOT NULL
  );
