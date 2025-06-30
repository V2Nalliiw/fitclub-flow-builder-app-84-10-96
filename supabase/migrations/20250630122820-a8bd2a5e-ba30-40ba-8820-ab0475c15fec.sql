
-- Verificar o status atual do usuário paciente@fitclub.app.br
SELECT user_id, name, email, role, clinic_id 
FROM public.profiles 
WHERE email = 'paciente@fitclub.app.br';

-- Atualizar o role para 'patient' caso não esteja correto
UPDATE public.profiles 
SET role = 'patient'
WHERE email = 'paciente@fitclub.app.br' 
  AND role != 'patient';

-- Verificar novamente após a atualização
SELECT user_id, name, email, role, clinic_id 
FROM public.profiles 
WHERE email = 'paciente@fitclub.app.br';
