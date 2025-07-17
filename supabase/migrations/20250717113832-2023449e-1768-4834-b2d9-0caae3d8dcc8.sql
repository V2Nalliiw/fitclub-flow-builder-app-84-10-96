-- Corrigir template WhatsApp novo_formulario com placeholders corretos
UPDATE whatsapp_templates 
SET content = 'Olá {patient_name}, você tem um novo formulário disponível para hoje!

Clique no link abaixo para acessar:
{form_url}

Responda quando puder 😊',
placeholders = ARRAY['patient_name', 'form_url']
WHERE name = 'novo_formulario' AND clinic_id IS NULL;