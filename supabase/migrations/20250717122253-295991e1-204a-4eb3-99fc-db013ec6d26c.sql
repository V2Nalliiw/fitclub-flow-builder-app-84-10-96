-- Adicionar controle de concorrência para evitar processamento duplicado de delay tasks
ALTER TABLE delay_tasks ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE delay_tasks ADD COLUMN IF NOT EXISTS processing_instance_id TEXT DEFAULT NULL;

-- Adicionar índice para otimizar consultas de delay tasks
CREATE INDEX IF NOT EXISTS idx_delay_tasks_trigger_processed ON delay_tasks(trigger_at, processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_delay_tasks_processing ON delay_tasks(processing_started_at, processing_instance_id) WHERE processing_started_at IS NOT NULL;