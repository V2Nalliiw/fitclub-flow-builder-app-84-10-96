
export interface PatientFlowExecution {
  id: string;
  flow_id: string;
  flow_name: string;
  paciente_id: string;
  status: 'em-andamento' | 'pausado' | 'concluido' | 'aguardando';
  no_atual: string;
  progresso: number; // 0-100
  started_at: string;
  completed_at?: string;
  next_step_available_at?: string;
  current_step: {
    id: string;
    type: 'start' | 'end' | 'formStart' | 'formEnd' | 'delay' | 'question';
    title: string;
    description?: string;
    completed: boolean;
  };
  total_steps: number;
  completed_steps: number;
}

export interface PatientFlowStep {
  id: string;
  execution_id: string;
  node_id: string;
  node_type: string;
  title: string;
  description?: string;
  status: 'pendente' | 'disponivel' | 'concluido' | 'aguardando';
  completed_at?: string;
  available_at?: string;
  form_url?: string;
  response?: any;
}
