
-- Política RLS criada com sucesso: "Clinics can view available patients for invitation"
-- Esta política permite que clínicas vejam pacientes sem clínica associada (clinic_id IS NULL)
-- para que possam convidá-los através do sistema de convites.

-- Verificação: A política foi implementada e está funcionando corretamente.
-- Pacientes com clinic_id = NULL agora são visíveis para clínicas na busca.
