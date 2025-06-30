
-- Adicionar coluna phone na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN phone text;

-- Criar um índice na coluna phone para melhor performance (opcional)
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
