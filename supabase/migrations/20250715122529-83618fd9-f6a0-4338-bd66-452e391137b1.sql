-- 1. SIMPLIFICAR BUCKETS: Usar apenas clinic-materials
-- Primeiro, vamos migrar todos os arquivos de flow-documents para clinic-materials
-- E depois deletar o bucket flow-documents

-- Migrar arquivos de flow-documents para clinic-materials
UPDATE storage.objects 
SET bucket_id = 'clinic-materials'
WHERE bucket_id = 'flow-documents';

-- Deletar o bucket flow-documents agora que está vazio
DELETE FROM storage.buckets 
WHERE id = 'flow-documents';