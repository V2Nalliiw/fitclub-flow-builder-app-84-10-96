
// Re-export auth types for backward compatibility
export type { User, AuthContextType } from './auth';

// Flow types remain the same
export interface Flow {
  id: string;
  nome: string;
  descricao?: string;
  clinica_id: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  ativo: boolean;
  created_at: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// Add missing Clinic interface
export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  chief_user_id: string;
  created_at: string;
}

// Add missing Patient interface
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic_id: string;
  avatar?: string;
  created_at: string;
}
