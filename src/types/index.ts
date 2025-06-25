
export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'clinic' | 'patient';
  name: string;
  avatar?: string;
  clinic_id?: string;
  is_chief?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  chief_user_id: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic_id: string;
  avatar?: string;
  created_at: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  clinic_id: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  is_active: boolean;
  created_at: string;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'form_start' | 'form_end' | 'time' | 'question';
  position: { x: number; y: number };
  data: {
    label: string;
    content?: string;
    options?: string[];
    questionType?: 'single' | 'multiple' | 'text';
    delay?: number;
    media?: string[];
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface FormResponse {
  id: string;
  patient_id: string;
  flow_id: string;
  node_id: string;
  response: any;
  created_at: string;
}
