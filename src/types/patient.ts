
export interface PatientFlowExecution {
  id: string;
  flow_id: string;
  flow_name: string;
  paciente_id: string;
  status: 'em-andamento' | 'in-progress' | 'pausado' | 'concluido' | 'aguardando';
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
  arquivos?: any[]; // Para arquivos do FormEnd
}

// Tipos para integração com Supabase
export interface SupabaseFlowExecution {
  id: string;
  flow_id: string;
  flow_name: string;
  patient_id: string;
  status: string;
  current_node: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
  next_step_available_at: string | null;
  total_steps: number;
  completed_steps: number;
  current_step: any;
  created_at: string;
  updated_at: string;
}

export interface SupabaseFlowStep {
  id: string;
  execution_id: string;
  node_id: string;
  node_type: string;
  title: string;
  description: string | null;
  status: string;
  completed_at: string | null;
  available_at: string | null;
  form_url: string | null;
  response: any | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseFormResponse {
  id: string;
  execution_id: string;
  node_id: string;
  patient_id: string;
  response: any;
  created_at: string;
}
