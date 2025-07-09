-- Atualizar templates existentes para serem marcados como oficiais se forem da Meta
-- Isso permite que sejam usados sem necessidade de opt-in

-- Marcar templates comuns como oficiais se forem globais (clinic_id é null)
UPDATE whatsapp_templates 
SET is_official = true 
WHERE clinic_id IS NULL 
  AND name IN ('codigo_verificacao', 'envio_formulario', 'mensagem_geral')
  AND is_active = true;

-- Opcional: Se houver templates específicos da clínica que também são aprovados pela Meta
-- UPDATE whatsapp_templates 
-- SET is_official = true 
-- WHERE clinic_id IS NOT NULL 
--   AND name IN ('template_aprovado_meta_1', 'template_aprovado_meta_2')
--   AND is_active = true;