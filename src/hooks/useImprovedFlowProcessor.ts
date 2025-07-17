import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  calculatorQuestionFields?: any[];
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

export const useImprovedFlowProcessor = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const buildFlowSteps = useCallback((
    nodes: FlowNode[], 
    edges: FlowEdge[], 
    startNode: FlowNode,
    userResponses: Record<string, any> = {},
    calculatorResults: Record<string, number> = {}
  ): FlowStep[] => {
    console.log('🏗️ Construindo steps do fluxo com respostas:', { userResponses, calculatorResults });
    
    const steps: FlowStep[] = [];
    const visited = new Set<string>();
    
    const traverseFlow = (nodeId: string, depth = 0) => {
      if (visited.has(nodeId) || depth > 50) return; // Prevenir loops infinitos
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      console.log(`  📍 Processando nó: ${node.type} (${node.data.titulo || node.data.label || nodeId})`);
      
      // Pular nós de início e fim
      if (node.type !== 'start' && node.type !== 'end') {
        // Para nós condicionais, avaliar condições
        if (node.type === 'conditions') {
          const shouldInclude = evaluateConditions(
            node.data.conditions || [], 
            userResponses, 
            calculatorResults
          );
          
          console.log(`  🎯 Condições avaliadas: ${shouldInclude}`);
          
          if (!shouldInclude) {
            // Condição não atendida, pular este nó
            const nextEdges = edges.filter(edge => edge.source === nodeId);
            nextEdges.forEach(edge => traverseFlow(edge.target, depth + 1));
            return;
          }
        }

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
              
              console.log(`  🎯 FormEnd ${nodeId}: Condição ${shouldInclude ? 'ATENDIDA' : 'NÃO ATENDIDA'}`);
              
              if (!shouldInclude) {
                console.log(`  ❌ FormEnd ${nodeId} rejeitado por condições`);
                return;
              }
            }
          }
        }

        
        // Criar step
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
          calculatorQuestionFields: node.data.calculatorQuestionFields,
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
        console.log(`  ✅ Step adicionado: ${step.title}`);
      }
      
      // Encontrar próximos nós
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      
      if (node.type === 'conditions') {
        // Para nós de condições, seguir apenas UM caminho baseado na avaliação
        const conditionMet = evaluateConditions(
          node.data.condicoesEspeciais || node.data.conditions || [], 
          userResponses, 
          calculatorResults
        );
        
        console.log(`  🎯 Conditions ${nodeId}: ${conditionMet ? 'ATENDIDA' : 'NÃO ATENDIDA'}`);
        console.log(`  📊 Edges disponíveis: ${nextEdges.length}`);
        console.log(`  📝 Dados das condições:`, node.data.condicoesEspeciais || node.data.conditions);
        
        // Usar nova lógica de condições especiais
        if (node.data.condicoesEspeciais && node.data.condicoesEspeciais.length > 0) {
          let targetEdge = null;
          
          // Avaliar cada condição especial para encontrar a primeira que bate
          for (let i = 0; i < node.data.condicoesEspeciais.length; i++) {
            const condition = node.data.condicoesEspeciais[i];
            const conditionResult = evaluateSpecialCondition(condition, userResponses, calculatorResults);
            
            console.log(`    🔍 Condição ${i}: ${condition.label} = ${conditionResult}`);
            
            if (conditionResult && nextEdges[i]) {
              targetEdge = nextEdges[i];
              console.log(`    ✅ Seguindo caminho da condição ${i}: ${targetEdge.target}`);
              break;
            }
          }
          
          // Se nenhuma condição foi atendida, usar o último edge como fallback
          if (!targetEdge && nextEdges.length > 0) {
            targetEdge = nextEdges[nextEdges.length - 1];
            console.log(`    🔄 Nenhuma condição atendida, usando fallback: ${targetEdge.target}`);
          }
          
          if (targetEdge) {
            traverseFlow(targetEdge.target, depth + 1);
          }
        } else {
          // Estratégia original para condições simples
          let targetEdge = null;
          
          if (conditionMet && nextEdges.length > 0) {
            targetEdge = nextEdges[0];
            console.log(`  ✅ Seguindo caminho TRUE: ${targetEdge.target}`);
          } else if (!conditionMet && nextEdges.length > 1) {
            targetEdge = nextEdges[1];
            console.log(`  ❌ Seguindo caminho FALSE: ${targetEdge.target}`);
          } else if (nextEdges.length > 0) {
            targetEdge = nextEdges[0];
            console.log(`  🔄 Fallback: ${targetEdge.target}`);
          }
          
          if (targetEdge) {
            traverseFlow(targetEdge.target, depth + 1);
          }
        }
      } else {
        // Para outros tipos de nó, seguir todos os caminhos
        nextEdges.forEach(edge => traverseFlow(edge.target, depth + 1));
      }
    };
    
    traverseFlow(startNode.id);
    
    console.log(`🎯 Flow construído com ${steps.length} steps:`, steps.map(s => `${s.nodeType}:${s.title}`));
    return steps;
  }, []);

  const evaluateConditions = useCallback((
    conditions: any[], 
    userResponses: Record<string, any>, 
    calculatorResults: Record<string, number>
  ) => {
    if (!conditions || conditions.length === 0) return true;

    console.log('🔍 Avaliando condições:', { conditions, userResponses, calculatorResults });

    return conditions.every(condition => {
      const { campo, operador, valor, valorFinal } = condition;
      let compareValue: any;

      // Buscar valor nas respostas ou resultados
      if (calculatorResults[campo] !== undefined) {
        compareValue = calculatorResults[campo];
      } else if (userResponses[campo] !== undefined) {
        compareValue = userResponses[campo];
      } else {
        const allData = { ...userResponses, ...calculatorResults };
        if (allData[campo] !== undefined) {
          compareValue = allData[campo];
        } else {
          console.warn(`❌ Campo ${campo} não encontrado`);
          return false;
        }
      }

      console.log(`  🎯 ${campo} ${operador} ${valor} | Valor atual: ${compareValue}`);

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
          return parseFloat(compareValue) >= parseFloat(valor) && 
                 parseFloat(compareValue) <= parseFloat(valorFinal || valor);
        default:
          console.warn(`❌ Operador ${operador} não reconhecido`);
          return false;
      }
    });
  }, []);

  const evaluateSpecialCondition = useCallback((
    condition: any, 
    userResponses: Record<string, any>, 
    calculatorResults: Record<string, number>
  ) => {
    const { campo, operador, valor, valorFinal, tipo } = condition;
    let compareValue: any;

    // Buscar valor nas respostas ou resultados
    if (calculatorResults[campo] !== undefined) {
      compareValue = calculatorResults[campo];
    } else if (userResponses[campo] !== undefined) {
      compareValue = userResponses[campo];
    } else {
      const allData = { ...userResponses, ...calculatorResults };
      if (allData[campo] !== undefined) {
        compareValue = allData[campo];
      } else {
        console.warn(`❌ Campo ${campo} não encontrado para condição especial`);
        return false;
      }
    }

    console.log(`  🎯 Condição especial: ${campo} ${operador} ${valor} | Valor atual: ${compareValue} | Tipo: ${tipo}`);

    if (tipo === 'numerico') {
      const numValue = typeof compareValue === 'number' ? compareValue : parseFloat(compareValue);
      const conditionValue = typeof valor === 'number' ? valor : parseFloat(valor as string);
      
      if (isNaN(numValue) || isNaN(conditionValue)) {
        return false;
      }

      switch (operador) {
        case 'igual':
          return numValue === conditionValue;
        case 'maior':
          return numValue > conditionValue;
        case 'menor':
          return numValue < conditionValue;
        case 'maior_igual':
          return numValue >= conditionValue;
        case 'menor_igual':
          return numValue <= conditionValue;
        case 'diferente':
          return numValue !== conditionValue;
        case 'entre':
          return valorFinal !== undefined && 
                 numValue >= conditionValue && 
                 numValue <= valorFinal;
        default:
          return false;
      }
    } else {
      // Tipo pergunta
      const strValue = String(compareValue).toLowerCase();
      const conditionValue = String(valor).toLowerCase();

      switch (operador) {
        case 'igual':
          return strValue === conditionValue;
        case 'diferente':
          return strValue !== conditionValue;
        case 'contem':
          return strValue.includes(conditionValue);
        default:
          return false;
      }
    }
  }, []);

  return {
    buildFlowSteps,
    evaluateConditions,
    evaluateSpecialCondition,
    processing
  };
};