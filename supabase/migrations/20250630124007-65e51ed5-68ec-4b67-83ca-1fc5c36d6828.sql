
-- Verificar se o usuário paciente@fitclub.app.br existe e qual seu status atual
SELECT 
    user_id, 
    name, 
    email, 
    role, 
    clinic_id,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'paciente@fitclub.app.br';

-- Verificar se existe algum problema com o role
SELECT 
    email,
    role,
    CASE 
        WHEN role = 'patient' THEN 'Role correto'
        ELSE 'Role incorreto: ' || role
    END as status_role
FROM public.profiles 
WHERE email = 'paciente@fitclub.app.br';

-- Buscar todos os pacientes para debug
SELECT 
    count(*) as total_pacientes,
    array_agg(DISTINCT role) as roles_encontrados
FROM public.profiles 
WHERE role = 'patient';
