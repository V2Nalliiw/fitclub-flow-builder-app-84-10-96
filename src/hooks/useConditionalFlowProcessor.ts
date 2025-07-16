
import { FlowNode, FlowEdge } from '@/types/flow';

interface FlowStep {
  nodeId: string;
  nodeType: string;
  title: string;
  description?: string;
  order: number;
  availableAt: string;
  completed: boolean;
  canGoBack?: boolean;
  pergunta?: string;
  tipoResposta?: 'escolha-unica' | 'multipla-escolha' | 'texto-livre';
  tipoExibicao?: 'aberto' | 'select';
  opcoes?: string[];
  formId?: string;
  tipoConteudo?: 'pdf' | 'imagem' | 'video' | 'ebook';
  arquivo?: string;
  arquivos?: any[];
  mensagemFinal?: string;
  delayAmount?: number;
  delayType?: 'minutos' | 'horas' | 'dias';
  calculatorFields?: any[];
  formula?: string;
  resultLabel?: string;
  conditions?: any[];
  calculatorResult?: number;
  nomenclatura?: string;
  prefixo?: string;
  sufixo?: string;
  tipoNumero?: 'inteiro' | 'decimal';
  operacao?: string;
  camposReferenciados?: string[];
  condicoesEspeciais?: any[];
  response?: any;
}

export const useConditionalFlowProcessor = () => {
  const evaluateConditions = (conditions: any[], userResponses: Record<string, any>, calculatorResults: Record<string, number>) => {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const { campo, operador, valor, valorFinal } = condition;
      let compareValue: any;

      // Buscar valor nas respostas do usuário ou resultados de calculadoras por nomenclatura
      if (calculatorResults[campo] !== undefined) {
        compareValue = calculatorResults[campo];
      } else if (userResponses[campo] !== undefined) {
        compareValue = userResponses[campo];
      } else {
        // Buscar em respostas diretas também
        const allData = { ...userResponses, ...calculatorResults };
        if (allData[campo] !== undefined) {
          compareValue = allData[campo];
        } else {
          console.warn(`Campo ${campo} não encontrado nas respostas ou resultados. Dados disponíveis:`, {
            userResponses,
            calculatorResults,
            allData
          });
          return false;
        }
      }

      console.log(`Avaliando condição: ${campo} ${operador} ${valor}. Valor atual: ${compareValue}`);

      switch (operador) {
        case 'igual':
          return compareValue === valor;
        case 'maior':
          return parseFloat(compareValue) > parseFloat(valor);
        case 'menor':
          return parseFloat(compareValue) < parseFloat(valor);
        case 'maior_igual':
          return parseFloat(compareValue) >= parseFloat(valor);
        case 'menor_igual':
          return parseFloat(compareValue) <= parseFloat(valor);
        case 'diferente':
          return compareValue !== valor;
        case 'entre':
          return parseFloat(compareValue) >= parseFloat(valor) && parseFloat(compareValue) <= parseFloat(valorFinal || valor);
        default:
          return false;
      }
    });
  };

  const buildConditionalFlowSteps = (
    nodes: FlowNode[], 
    edges: FlowEdge[], 
    startNode: FlowNode,
    userResponses: Record<string, any> = {},
    calculatorResults: Record<string, number> = {}
  ): FlowStep[] => {
    const steps: FlowStep[] = [];
    const visited = new Set<string>();
    const correctPath = new Set<string>(); // Track the correct path taken
    
    console.log('🚀 NOVA LÓGICA: Construindo fluxo condicional:', { userResponses, calculatorResults });
    
    // First pass: determine the correct path based on conditions
    const determineCorrectPath = (nodeId: string, path: string[] = []): string[] => {
      if (path.includes(nodeId)) return path; // Prevent infinite loops
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return path;
      
      const newPath = [...path, nodeId];
      console.log(`🔍 Analisando nó: ${node.type} (${node.data.titulo || node.data.label || nodeId})`);
      
      // For conditions nodes, determine which path to follow
      if (node.type === 'conditions') {
        const conditionMet = evaluateConditions(
          node.data.conditions || [], 
          userResponses, 
          calculatorResults
        );
        
        const nextEdges = edges.filter(edge => edge.source === nodeId);
        console.log(`🎯 Conditions ${nodeId}: ${conditionMet ? 'ATENDIDA' : 'NÃO ATENDIDA'} | Edges: ${nextEdges.length}`);
        
        // Choose the correct edge based on condition evaluation
        let targetEdge = null;
        if (conditionMet && nextEdges.length > 0) {
          targetEdge = nextEdges[0]; // TRUE path
          console.log(`✅ Escolhendo caminho TRUE: ${targetEdge.target}`);
        } else if (!conditionMet && nextEdges.length > 1) {
          targetEdge = nextEdges[1]; // FALSE path  
          console.log(`❌ Escolhendo caminho FALSE: ${targetEdge.target}`);
        } else if (nextEdges.length > 0) {
          targetEdge = nextEdges[0]; // Fallback
          console.log(`🔄 Fallback: ${targetEdge.target}`);
        }
        
        if (targetEdge) {
          return determineCorrectPath(targetEdge.target, newPath);
        }
      } else {
        // For other nodes, follow all edges (but we'll filter later)
        const nextEdges = edges.filter(edge => edge.source === nodeId);
        if (nextEdges.length > 0) {
          // For non-condition nodes, just take the first edge to continue the path
          return determineCorrectPath(nextEdges[0].target, newPath);
        }
      }
      
      return newPath;
    };
    
    // Determine the correct path first
    const correctPathIds = determineCorrectPath(startNode.id);
    correctPathIds.forEach(id => correctPath.add(id));
    
    console.log(`📍 Caminho correto determinado: ${correctPathIds.join(' → ')}`);
    
    // Second pass: build steps only for nodes in the correct path
    const traverseFlow = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Only process nodes that are in the correct path
      if (!correctPath.has(nodeId)) {
        console.log(`⏭️ Pulando nó fora do caminho correto: ${node.type} (${nodeId})`);
        return;
      }
      
      console.log(`📍 Processando nó no caminho correto: ${node.type} (${node.data.titulo || node.data.label || nodeId})`);
      
      // Skip start and end nodes in steps
      if (node.type !== 'start' && node.type !== 'end') {
        
        // Special handling for FormEnd - only include if in correct path
        if (node.type === 'formEnd') {
          // Check if this FormEnd is connected to a conditions node
          const conditionsEdge = edges.find(edge => edge.target === nodeId);
          if (conditionsEdge) {
            const conditionsNode = nodes.find(n => n.id === conditionsEdge.source);
            if (conditionsNode?.type === 'conditions') {
              // Only include if conditions are met
              const shouldInclude = evaluateConditions(
                conditionsNode.data.conditions || [], 
                userResponses, 
                calculatorResults
              );
              
              console.log(`🎯 FormEnd ${nodeId}: Condição ${shouldInclude ? 'ATENDIDA' : 'NÃO ATENDIDA'}`);
              
              if (!shouldInclude) {
                console.log(`❌ FormEnd ${nodeId} REJEITADO - condição não atendida`);
                return;
              }
            }
          }
          
          console.log(`✅ FormEnd ${nodeId} INCLUÍDO - no caminho correto`);
        }
        
        const step: FlowStep = {
          nodeId: node.id,
          nodeType: node.type,
          title: node.data.titulo || node.data.label || `Etapa ${steps.length + 1}`,
          description: node.data.descricao,
          pergunta: node.data.pergunta,
          opcoes: node.data.opcoes,
          tipoResposta: node.data.tipoResposta,
          tipoExibicao: node.data.tipoExibicao,
          arquivo: node.data.arquivo,
          arquivos: node.data.arquivos,
          mensagemFinal: node.data.mensagemFinal,
          tipoConteudo: node.data.tipoConteudo,
          delayAmount: node.data.quantidade,
          delayType: node.data.tipoIntervalo,
          calculatorFields: node.data.calculatorFields,
          formula: node.data.formula,
          resultLabel: node.data.resultLabel,
          conditions: node.data.conditions,
          nomenclatura: node.data.nomenclatura,
          prefixo: node.data.prefixo,
          sufixo: node.data.sufixo,
          tipoNumero: node.data.tipoNumero,
          operacao: node.data.operacao,
          camposReferenciados: node.data.camposReferenciados,
          condicoesEspeciais: node.data.condicoesEspeciais,
          completed: false,
          response: null,
          order: steps.length + 1,
          availableAt: new Date().toISOString(),
          canGoBack: steps.length > 0
        };
        
        steps.push(step);
        console.log(`✅ Step adicionado: ${step.nodeType}:${step.title}`);
      }
      
      // Continue traversing in the correct path
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      nextEdges.forEach(edge => {
        if (correctPath.has(edge.target)) {
          traverseFlow(edge.target);
        }
      });
    };
    
    traverseFlow(startNode.id);
    
    console.log(`🎯 RESULTADO FINAL:`);
    console.log(`   - Caminho correto: ${Array.from(correctPath).join(' → ')}`);
    console.log(`   - Total de steps: ${steps.length}`);
    console.log(`   - Steps incluídos:`, steps.map(s => `${s.nodeType}:${s.title}`));
    
    return steps;
  };

  return {
    buildConditionalFlowSteps,
    evaluateConditions
  };
};
