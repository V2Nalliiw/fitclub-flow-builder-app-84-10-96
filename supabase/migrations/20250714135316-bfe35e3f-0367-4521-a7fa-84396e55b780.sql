-- Update the codigo_verificacao template to use named placeholders and improve UX
UPDATE whatsapp_templates 
SET 
  content = '🔐 *Código de Verificação*

Seu código de verificação é:

*{code}*

Para copiar: toque e segure no código acima e selecione "Copiar".

⏰ Este código expira em {expiry_time}.
🔒 Para sua segurança, não compartilhe este código.

_{clinic_name}_',
  placeholders = ARRAY['code', 'clinic_name', 'expiry_time'],
  is_official = false,
  updated_at = now()
WHERE name = 'codigo_verificacao';