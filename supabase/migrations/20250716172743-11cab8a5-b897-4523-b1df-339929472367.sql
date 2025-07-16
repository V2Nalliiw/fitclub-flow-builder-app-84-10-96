-- 1. Verificar cron jobs existentes
SELECT * FROM cron.job;

-- 2. Criar o cron job sem tentar remover o anterior
SELECT cron.schedule(
  'process-delay-tasks',
  '* * * * *', -- A cada minuto
  $$
  SELECT
    net.http_post(
        url:='https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/cron-delay-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg3NDY3OSwiZXhwIjoyMDY2NDUwNjc5fQ.NcJlJANZY3ZhIcL1t2BOwPOkCLCGBpOqXAl1L8QJkGU"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);