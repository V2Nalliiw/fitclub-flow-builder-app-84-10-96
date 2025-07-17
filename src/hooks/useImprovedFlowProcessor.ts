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
  compositeConditions?: any[];
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
        // SEMPRE incluir nós de condições como steps visíveis
        // A avaliação acontecerá quando o paciente interagir com o ConditionsStepRenderer

        // Para FormEnd, só incluir se houver dados suficientes para avaliar condições
        // ou se for a primeira passagem (construção inicial)
        if (node.type === 'formEnd') {
          const conditionsEdge = edges.find(edge => edge.target === nodeId);
          if (conditionsEdge) {
            const conditionsNode = nodes.find(n => n.id === conditionsEdge.source);
            if (conditionsNode?.type === 'conditions') {
              // Se houver respostas/resultados de cálculo, avaliar condições
              if (Object.keys(userResponses).length > 0 || Object.keys(calculatorResults).length > 0) {
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
              } else {
                // Se não há dados para avaliar, pular FormEnd na construção inicial
                console.log(`  ⏸️ FormEnd ${nodeId} pulado - sem dados para avaliar condições`);
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
          compositeConditions: node.data.compositeConditions,
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
        // Se há dados suficientes para avaliar condições (após responses/cálculos)
        if (Object.keys(userResponses).length > 0 || Object.keys(calculatorResults).length > 0) {
          // Para nós de condições, seguir apenas UM caminho baseado na avaliação
          const conditionMet = evaluateConditions(
            node.data.condicoesEspeciais || node.data.conditions || [], 
            userResponses, 
            calculatorResults
          );
          
          console.log(`  🎯 Conditions ${nodeId}: ${conditionMet ? 'ATENDIDA' : 'NÃO ATENDIDA'}`);
          console.log(`  📊 Edges disponíveis: ${nextEdges.length}`);
          console.log(`  📝 Dados das condições:`, node.data.condicoesEspeciais || node.data.conditions);
          
          // Verificar se há condições compostas (novo formato)
          if (node.data.compositeConditions && node.data.compositeConditions.length > 0) {
            console.log(`  🔍 Avaliando condições compostas para nó ${nodeId}:`, node.data.compositeConditions);
            let targetEdge = null;
            
            // Avaliar cada condição composta para encontrar a primeira que bate
            for (let i = 0; i < node.data.compositeConditions.length; i++) {
              const condition = node.data.compositeConditions[i];
              const conditionResult = evaluateCompositeCondition(condition, userResponses, calculatorResults);
              
              console.log(`    🔍 Condição composta ${i}: ${condition.label} = ${conditionResult}`);
              
              if (conditionResult && nextEdges[i]) {
                targetEdge = nextEdges[i];
                console.log(`    ✅ Seguindo caminho da condição composta ${i}: ${targetEdge.target}`);
                break;
              }
            }
            
            // Se nenhuma condição foi atendida, usar o último edge como fallback
            if (!targetEdge && nextEdges.length > 0) {
              targetEdge = nextEdges[nextEdges.length - 1];
              console.log(`    🔄 Nenhuma condição composta atendida, usando fallback: ${targetEdge.target}`);
            }
            
            if (targetEdge) {
              traverseFlow(targetEdge.target, depth + 1);
            }
          }
          // Usar nova lógica de condições especiais (formato legado)
          else if (node.data.condicoesEspeciais && node.data.condicoesEspeciais.length > 0) {
            let targetEdge = null;
            
            // Avaliar cada condição especial para encontrar a primeira que bate
            for (let i = 0; i < node.data.condicoesEspeciais.length; i++) {
              const condition = node.data.condicoesEspeciais[i];
              const conditionResult = evaluateSpecialCondition(condition, userResponses, calculatorResults);
              
              console.log(`    🔍 Condição especial ${i}: ${condition.label} = ${conditionResult}`);
              
              if (conditionResult && nextEdges[i]) {
                targetEdge = nextEdges[i];
                console.log(`    ✅ Seguindo caminho da condição especial ${i}: ${targetEdge.target}`);
                break;
              }
            }
            
            // Se nenhuma condição foi atendida, usar o último edge como fallback
            if (!targetEdge && nextEdges.length > 0) {
              targetEdge = nextEdges[nextEdges.length - 1];
              console.log(`    🔄 Nenhuma condições especiais atendida, usando fallback: ${targetEdge.target}`);
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
          // Se não há dados suficientes, apenas seguir primeiro caminho (construção inicial)
          console.log(`  ⏸️ Conditions ${nodeId}: Sem dados para avaliar, seguindo primeiro caminho`);
          if (nextEdges.length > 0) {
            traverseFlow(nextEdges[0].target, depth + 1);
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

  const evaluateCompositeCondition = useCallback((
    condition: any, 
    userResponses: Record<string, any>, 
    calculatorResults: Record<string, number>
  ) => {
    if (!condition.rules || condition.rules.length === 0) {
      console.log('❌ Condição composta sem regras');
      return false;
    }

    console.log('🔍 Avaliando condição composta:', condition);
    console.log('📊 Dados disponíveis:', { userResponses, calculatorResults });

    const results = condition.rules.map((rule: any) => {
      const { sourceType, sourceField, operator, value, valueEnd } = rule;
      let compareValue: any;

      if (sourceType === 'calculation') {
        compareValue = calculatorResults[sourceField];
        console.log(`📊 Valor do cálculo '${sourceField}':`, compareValue);
      } else if (sourceType === 'question') {
        compareValue = userResponses[sourceField];
        console.log(`❓ Resposta da pergunta '${sourceField}':`, compareValue);
      }

      if (compareValue === undefined || compareValue === null) {
        console.warn(`⚠️ Campo ${sourceField} não encontrado para avaliação da regra composta`);
        return false;
      }

      console.log(`🔢 Comparando: ${compareValue} ${operator} ${value}`);

      switch (operator) {
        case 'equal':
          return compareValue === value;
        case 'not_equal':
          return compareValue !== value;
        case 'greater':
          return parseFloat(compareValue) > parseFloat(value);
        case 'less':
          return parseFloat(compareValue) < parseFloat(value);
        case 'greater_equal':
          return parseFloat(compareValue) >= parseFloat(value);
        case 'less_equal':
          return parseFloat(compareValue) <= parseFloat(value);
        case 'between':
          return parseFloat(compareValue) >= parseFloat(value) && parseFloat(compareValue) <= parseFloat(valueEnd);
        case 'contains':
          return String(compareValue).includes(String(value));
        case 'in':
          return Array.isArray(value) ? value.includes(compareValue) : false;
        default:
          console.warn(`⚠️ Operador desconhecido na condição composta: ${operator}`);
          return false;
      }
    });

    const finalResult = condition.logic === 'AND' ? 
      results.every(r => r) : 
      results.some(r => r);

    console.log(`🎯 Resultado final da condição composta '${condition.label}': ${finalResult} (lógica: ${condition.logic})`);
    return finalResult;
  }, []);

  return {
    buildFlowSteps,
    evaluateConditions,
    evaluateSpecialCondition,
    evaluateCompositeCondition,
    processing
  };
};