export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'formStart' | 'formEnd' | 'formSelect' | 'delay' | 'question';
  position: { x: number; y: number };
  data: {
    label: string;
    // Campos específicos por tipo de nó
    titulo?: string;
    descricao?: string;
    mensagemFinal?: string;
    tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
    arquivo?: string;
    pergunta?: string;
    tipoResposta?: 'escolha-unica' | 'multipla-escolha' | 'texto-livre';
    opcoes?: string[];
    tipoIntervalo?: 'minutos' | 'horas' | 'dias';
    quantidade?: number;
    // Campos para formulário selecionado
    formId?: string;
    formName?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

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

export interface FlowExecution {
  id: string;
  flow_id: string;
  paciente_id: string;
  status: 'em-andamento' | 'pausado' | 'concluido';
  no_atual: string;
  started_at: string;
  completed_at?: string;
}

export interface FormResponse {
  id: string;
  execution_id: string;
  node_id: string;
  paciente_id: string;
  resposta: any;
  created_at: string;
}
