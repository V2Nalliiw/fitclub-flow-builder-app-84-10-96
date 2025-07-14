-- Atualizar template WhatsApp para melhor suporte a múltiplos arquivos
UPDATE whatsapp_templates 
SET content = '🎉 *Parabéns {patient_name}!*

Seu formulário foi concluído com sucesso! 

📋 *Material disponível para download:*
{content_url}

⏰ *Link válido por 30 dias*

Este link contém todos os documentos relacionados ao seu atendimento. 

Para baixar, clique no link acima e selecione os arquivos que deseja.

_Mensagem automática do sistema_'
WHERE name = 'material_disponivel' AND is_active = true;

-- Inserir template se não existir
INSERT INTO whatsapp_templates (name, content, is_active, is_official, clinic_id)
SELECT 
  'material_disponivel',
  '🎉 *Parabéns {patient_name}!*

Seu formulário foi concluído com sucesso! 

📋 *Material disponível para download:*
{content_url}

⏰ *Link válido por 30 dias*

Este link contém todos os documentos relacionados ao seu atendimento. 

Para baixar, clique no link acima e selecione os arquivos que deseja.

_Mensagem automática do sistema_',
  true,
  true,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM whatsapp_templates 
  WHERE name = 'material_disponivel' AND is_active = true
);