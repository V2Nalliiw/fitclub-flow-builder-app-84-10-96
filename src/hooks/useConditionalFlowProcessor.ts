
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
    const pathTaken = new Set<string>(); // Rastreio do caminho específico seguido
    
    console.log('🚀 Construindo fluxo condicional:', { userResponses, calculatorResults });
    
    const traverseFlow = (nodeId: string, fromCondition: boolean = false) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      pathTaken.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      console.log(`📍 Processando nó: ${node.type} (${node.data.titulo || node.data.label || nodeId})`);
      
      // Skip start and end nodes in steps
      if (node.type !== 'start' && node.type !== 'end') {
        
        // Para FormEnd, verificar se é o caminho correto baseado nas condições
        if (node.type === 'formEnd') {
          const conditionsEdge = edges.find(edge => edge.target === nodeId);
          if (conditionsEdge) {
            const conditionsNode = nodes.find(n => n.id === conditionsEdge.source);
            if (conditionsNode?.type === 'conditions') {
              const shouldInclude = evaluateConditions(
                conditionsNode.data.conditions || [], 
                userResponses, 
                calculatorResults
              );
              
              console.log(`🎯 FormEnd: Condição ${shouldInclude ? 'ATENDIDA' : 'NÃO ATENDIDA'} para nó ${nodeId}`);
              
              if (!shouldInclude) {
                console.log(`❌ FormEnd: Pulando nó ${nodeId} - condição não atendida`);
                return; // Não incluir este FormEnd
              }
            }
          }
        }

        // Para nós condicionais, avaliar antes de incluir
        if (node.type === 'conditions') {
          const shouldInclude = evaluateConditions(
            node.data.conditions || [], 
            userResponses, 
            calculatorResults
          );
          
          console.log(`🔍 Conditions: ${shouldInclude ? 'ATENDIDA' : 'NÃO ATENDIDA'} para nó ${nodeId}`);
          
          // Incluir o nó de condições apenas se a condição for atendida
          if (!shouldInclude) {
            // Pular este nó e não seguir seus caminhos
            console.log(`❌ Conditions: Pulando nó ${nodeId} e seus caminhos`);
            return;
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
      
      // Find next nodes - lógica melhorada para seguir apenas um caminho correto
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      
      if (node.type === 'conditions') {
        // Para nós de condições, seguir apenas o caminho correto baseado na avaliação
        const conditionMet = evaluateConditions(
          node.data.conditions || [], 
          userResponses, 
          calculatorResults
        );
        
        console.log(`🎯 Avaliando caminhos para conditions ${nodeId}: condição ${conditionMet ? 'ATENDIDA' : 'NÃO ATENDIDA'}`);
        
        // Estratégia específica: se condição atendida, seguir primeiro caminho; se não, segundo caminho
        let targetEdge = null;
        
        if (conditionMet && nextEdges.length > 0) {
          // Condição atendida - seguir primeiro edge (normalmente FormEnd "true")
          targetEdge = nextEdges[0];
          console.log(`✅ Seguindo primeiro caminho (condição TRUE): ${targetEdge.target}`);
        } else if (!conditionMet && nextEdges.length > 1) {
          // Condição não atendida - seguir segundo edge (normalmente FormEnd "false")
          targetEdge = nextEdges[1];
          console.log(`❌ Seguindo segundo caminho (condição FALSE): ${targetEdge.target}`);
        } else if (nextEdges.length > 0) {
          // Fallback - seguir primeiro disponível
          targetEdge = nextEdges[0];
          console.log(`🔄 Fallback: seguindo primeiro edge disponível: ${targetEdge.target}`);
        }
        
        if (targetEdge) {
          traverseFlow(targetEdge.target, true);
        }
      } else if (node.type === 'formEnd') {
        // FormEnd termina formulário, mas pode continuar fluxo
        console.log(`🏁 FormEnd: Terminando formulário ${nodeId}, verificando continuação...`);
        
        // Verificar se há continuação após FormEnd
        if (nextEdges.length > 0) {
          console.log(`➡️ FormEnd: Encontrada continuação, seguindo fluxo...`);
          nextEdges.forEach(edge => traverseFlow(edge.target));
        } else {
          console.log(`🛑 FormEnd: Fim da linha, formulário finalizado`);
        }
      } else {
        // Para outros tipos de nó, seguir todos os caminhos disponíveis
        nextEdges.forEach(edge => traverseFlow(edge.target));
      }
    };
    
    traverseFlow(startNode.id);
    
    console.log(`🎯 Fluxo condicional construído:`);
    console.log(`   - Total de steps: ${steps.length}`);
    console.log(`   - Caminho seguido: ${Array.from(pathTaken).join(' → ')}`);
    console.log(`   - Steps finais:`, steps.map(s => `${s.nodeType}:${s.title}`));
    
    return steps;
  };

  return {
    buildConditionalFlowSteps,
    evaluateConditions
  };
};
