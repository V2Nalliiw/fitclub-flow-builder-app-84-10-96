
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

      // Buscar valor nas respostas do usuário ou resultados de calculadoras
      if (calculatorResults[campo] !== undefined) {
        compareValue = calculatorResults[campo];
      } else if (userResponses[campo] !== undefined) {
        compareValue = userResponses[campo];
      } else {
        console.warn(`Campo ${campo} não encontrado nas respostas ou resultados. Dados disponíveis:`, {
          userResponses,
          calculatorResults
        });
        return false;
      }

      console.log(`Avaliando condição: ${campo} ${operador} ${valor}. Valor atual: ${compareValue}`);

      switch (operador) {
        case 'igual':
          return compareValue === valor;
        case 'maior':
          return compareValue > valor;
        case 'menor':
          return compareValue < valor;
        case 'maior_igual':
          return compareValue >= valor;
        case 'menor_igual':
          return compareValue <= valor;
        case 'diferente':
          return compareValue !== valor;
        case 'entre':
          return compareValue >= valor && compareValue <= (valorFinal || valor);
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
    
    const traverseFlow = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Skip start and end nodes in steps
      if (node.type !== 'start' && node.type !== 'end') {
        // Para nós condicionais, avaliar se devem ser incluídos
        if (node.type === 'conditions') {
          const shouldInclude = evaluateConditions(
            node.data.conditions || [], 
            userResponses, 
            calculatorResults
          );
          
          if (!shouldInclude) {
            // Se condição não for atendida, pular este nó e seguir para próximo
            const nextEdges = edges.filter(edge => edge.source === nodeId);
            nextEdges.forEach(edge => traverseFlow(edge.target));
            return;
          }
        }

        // Para FormEnd, verificar se é o caminho correto baseado nas condições anteriores
        if (node.type === 'formEnd') {
          // Encontrar nó de condições que leva a este FormEnd
          const conditionsEdge = edges.find(edge => edge.target === nodeId);
          if (conditionsEdge) {
            const conditionsNode = nodes.find(n => n.id === conditionsEdge.source);
            if (conditionsNode?.type === 'conditions') {
              const shouldInclude = evaluateConditions(
                conditionsNode.data.conditions || [], 
                userResponses, 
                calculatorResults
              );
              
              if (!shouldInclude) {
                return; // Não incluir este FormEnd
              }
            }
          }
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
      }
      
      // Find next nodes - para conditions, seguir apenas um caminho
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      
      if (node.type === 'conditions') {
        // Para nós de condições, avaliar e seguir apenas um caminho
        const conditionMet = evaluateConditions(
          node.data.conditions || [], 
          userResponses, 
          calculatorResults
        );
        
        // Encontrar o edge correto baseado na condição
        const targetEdge = nextEdges.find(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (conditionMet && targetNode?.type === 'formEnd') {
            // Se condição atendida, ir para o FormEnd correspondente
            return targetNode.data.mensagemFinal?.includes('positivo') || 
                   targetNode.data.mensagemFinal?.includes('aprovado');
          } else if (!conditionMet && targetNode?.type === 'formEnd') {
            // Se condição não atendida, ir para o outro FormEnd
            return targetNode.data.mensagemFinal?.includes('negativo') ||
                   targetNode.data.mensagemFinal?.includes('reprovado');
          }
          return false;
        });
        
        if (targetEdge) {
          traverseFlow(targetEdge.target);
        } else {
          // Fallback: seguir o primeiro edge
          nextEdges.forEach(edge => traverseFlow(edge.target));
        }
      } else {
        // Para outros tipos de nó, seguir normalmente
        nextEdges.forEach(edge => traverseFlow(edge.target));
      }
    };
    
    traverseFlow(startNode.id);
    return steps;
  };

  return {
    buildConditionalFlowSteps,
    evaluateConditions
  };
};
