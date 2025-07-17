-- Habilitar realtime para a tabela flow_executions
ALTER TABLE flow_executions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE flow_executions;