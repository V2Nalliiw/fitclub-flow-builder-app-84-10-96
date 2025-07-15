
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
    calculatorQuestionFields?: CalculatorQuestionField[];
    formula?: string;
    resultLabel?: string;
    // Campos específicos para o nó condições
    conditions?: LegacyConditionRule[];
    compositeConditions?: CompositeCondition[];
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
  fieldType: 'calculo'; // Tipo do campo
  order: number; // Para ordenação
}

export interface CalculatorQuestionField {
  id: string;
  nomenclatura: string;
  pergunta: string;
  fieldType: 'pergunta'; // Tipo do campo
  questionType: 'escolha-unica' | 'multipla-escolha';
  opcoes: string[];
  order: number; // Para ordenação
}

// Interface legada para compatibilidade
export interface LegacyConditionRule {
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
  name: string;
  description?: string;
  
  // Fontes de dados disponíveis no fluxo
  dataSources: {
    numericFields: string[];     // ['peso', 'altura', 'idade']
    questionResponses: string[]; // ['pergunta_1', 'pergunta_2']
    calculationResults: string[]; // ['imc', 'calculo_dose']
  };
  
  // Estrutura da expressão lógica
  expression: {
    type: 'simple' | 'complex';
    rules: ConditionRule[];
    logic: 'AND' | 'OR';
  };
  
  // Ações baseadas no resultado
  outcomes: {
    true: { nextNode?: string; message?: string };
    false: { nextNode?: string; message?: string };
  };
  
  label: string;
}

export interface ConditionRule {
  id: string;
  source: {
    type: 'numeric' | 'question' | 'calculation' | 'combined';
    field: string;
    aggregation?: 'sum' | 'average' | 'max' | 'min' | 'count'; // Para combinar múltiplos valores
  };
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'contains' | 'in';
  value: any;
  valueEnd?: any; // Para operador 'between'
}

// Novas interfaces para condições compostas
export interface CompositeConditionRule {
  id: string;
  sourceType: 'calculation' | 'question'; // Fonte dos dados
  sourceField: string; // Campo específico (nomenclatura)
  operator: 'equal' | 'not_equal' | 'greater' | 'less' | 'greater_equal' | 'less_equal' | 'between' | 'contains' | 'in';
  value: any;
  valueEnd?: any; // Para operador 'between'
}

export interface CompositeCondition {
  id: string;
  label: string;
  logic: 'AND' | 'OR'; // Operador lógico entre regras
  rules: CompositeConditionRule[]; // Múltiplas regras
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
