-- Tornar a edge function serve-content pública
UPDATE auth.schemas SET verify_jwt = false WHERE name = 'serve-content';