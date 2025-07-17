-- Update the flow_executions table constraint to accept Portuguese status values
ALTER TABLE flow_executions 
DROP CONSTRAINT IF EXISTS flow_executions_status_check;

-- Add new constraint with Portuguese values
ALTER TABLE flow_executions 
ADD CONSTRAINT flow_executions_status_check 
CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'em-andamento', 'concluido', 'pausado'));