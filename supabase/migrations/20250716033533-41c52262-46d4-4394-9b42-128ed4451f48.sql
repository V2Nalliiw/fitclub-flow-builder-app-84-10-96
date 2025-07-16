-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para processar delay tasks a cada minuto
SELECT cron.schedule(
  'process-delay-tasks-cron',
  '* * * * *', -- A cada minuto
  $$
  SELECT
    net.http_post(
        url:='https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/cron-delay-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ2NzksImV4cCI6MjA2NjQ1MDY3OX0.QzSb4EzbVXh3UmWhHiMNP9fsctIJv2Uqg2Bia6ntZAY"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);