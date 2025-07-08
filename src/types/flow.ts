
export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'formStart' | 'formEnd' | 'formSelect' | 'delay' | 'question' | 'calculator' | 'conditions' | 'number' | 'simpleCalculator' | 'specialConditions';
  position: { x: number; y: number };
  data: {
    label: string;
    // Campos específicos por tipo de nó
    titulo?: string;
    descricao?: string;
    mensagemFinal?: string;
    tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
    arquivo?: string;
    arquivos?: FileUploadConfig[]; // Para múltiplos uploads
    tipoResposta?: 'escolha-unica' | 'multipla-escolha'; // Removido 'texto-livre'
    tipoExibicao?: 'aberto' | 'select'; // Como exibir as opções
    opcoes?: string[];
    tipoIntervalo?: 'minutos' | 'horas' | 'dias';
    quantidade?: number;
    // Campos para formulário selecionado
    formId?: string;
    formName?: string;
    // Campos específicos para o nó calculadora
    calculatorFields?: CalculatorField[];
    formula?: string;
    resultLabel?: string;
    // Campos específicos para o nó condições
    conditions?: ConditionRule[];
    // Campos específicos para o nó número
    pergunta?: string; // Nova: pergunta para o paciente responder
    nomenclatura?: string;
    prefixo?: string;
    sufixo?: string;
    tipoNumero?: 'inteiro' | 'decimal';
    // Campos específicos para calculadora simples
    operacao?: string; // Ex: "a+b-c*d"
    camposReferenciados?: string[]; // Nomenclaturas dos nós número
    // Campos específicos para condições especiais
    condicoesEspeciais?: SpecialConditionRule[];
  };
}

export interface CalculatorField {
  id: string;
  nomenclatura: string;
  pergunta: string;
  prefixo?: string;
  sufixo?: string;
  tipo: 'numero' | 'decimal';
}

export interface ConditionRule {
  id: string;
  campo: string;
  operador: 'igual' | 'maior' | 'menor' | 'maior_igual' | 'menor_igual' | 'diferente' | 'entre';
  valor: number;
  valorFinal?: number; // Para o operador "entre"
  label: string;
}

export interface FileUploadConfig {
  id: string;
  label: string;
  tipoArquivo: 'pdf' | 'imagem' | 'video' | 'documento' | 'qualquer';
  obrigatorio: boolean;
  multiplos: boolean;
}

export interface SpecialConditionRule {
  id: string;
  tipo: 'numerico' | 'pergunta' | 'calculo' | 'combinacao';
  campo: string; // nomenclatura ou id da pergunta
  operador: 'igual' | 'maior' | 'menor' | 'maior_igual' | 'menor_igual' | 'diferente' | 'entre' | 'contem';
  valor: number | string;
  valorFinal?: number; // Para o operador "entre"
  label: string;
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
