-- Verificar se template formulario_concluido existe e está ativo
DO $$
BEGIN
  -- Se não existir, criar o template
  IF NOT EXISTS (SELECT 1 FROM whatsapp_templates WHERE name = 'formulario_concluido') THEN
    INSERT INTO whatsapp_templates (
      name,
      content,
      placeholders,
      is_active,
      is_official,
      clinic_id
    ) VALUES (
      'formulario_concluido',
      '🎉 *Formulário Concluído*

{patient_name}, obrigado por completar o formulário!

📁 Seus conteúdos estão disponíveis em: {content_url}

_Aproveite o material!_',
      ARRAY['patient_name', 'content_url'],
      true,
      true,
      null
    );
  ELSE
    -- Se existir, garantir que está ativo
    UPDATE whatsapp_templates 
    SET is_active = true 
    WHERE name = 'formulario_concluido';
  END IF;
END $$;