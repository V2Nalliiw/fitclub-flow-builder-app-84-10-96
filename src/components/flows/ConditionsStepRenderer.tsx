
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface ConditionsStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
  calculatorResult?: number;
  questionResponses?: Record<string, any>;
  calculatorResults?: Record<string, number>;
}

export const ConditionsStepRenderer: React.FC<ConditionsStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  calculatorResult,
  questionResponses = {},
  calculatorResults = {}
}) => {
  const [evaluatedCondition, setEvaluatedCondition] = useState<any>(null);


  // Normalize operators from Portuguese to standard
  const normalizeOperator = (operador: string): string => {
    const operatorMap: Record<string, string> = {
      'igual': 'equal',
      'maior': 'greater',
      'menor': 'less', 
      'maior_igual': 'greater_equal',
      'menor_igual': 'less_equal',
      'diferente': 'not_equal',
      'entre': 'between'
    };
    return operatorMap[operador] || operador;
  };

  // Get comparison value from multiple sources with fallback
  const getCompareValue = (campo: string, sourceField?: string): any => {
    // Try exact field name
    if (calculatorResults[campo] !== undefined) {
      return calculatorResults[campo];
    }
    if (questionResponses[campo] !== undefined) {
      return questionResponses[campo];
    }
    
    // Try common mappings for calculator results
    if (campo === 'resultado' || campo === 'formula_result' || campo === 'imc' || campo === 'bmi') {
      if (calculatorResults['formula_result'] !== undefined) {
        return calculatorResults['formula_result'];
      }
      if (calculatorResult !== undefined) {
        return calculatorResult;
      }
    }
    
    // Try sourceField as fallback
    if (sourceField) {
      if (calculatorResults[sourceField] !== undefined) {
        return calculatorResults[sourceField];
      }
      if (questionResponses[sourceField] !== undefined) {
        return questionResponses[sourceField];
      }
    }
    
    return undefined;
  };

  // Evaluate legacy conditions (for backwards compatibility)
  const evaluateConditions = (result: number, conditions: any[]): any | null => {
    if (!conditions || conditions.length === 0) return null;
    
    console.log('🔍 Avaliando condições legadas:', conditions);
    console.log('📊 Calculator result:', result);
    console.log('📊 Calculator results:', calculatorResults);
    
    for (const condition of conditions) {
      const { campo, operador, valor, valorFinal } = condition;
      let compareValue = getCompareValue(campo);

      console.log(`🧪 Testando condição: ${campo} ${operador} ${valor}`, {
        condition,
        compareValue,
        result
      });

      if (compareValue === undefined || compareValue === null) {
        console.warn(`⚠️ Campo ${campo} não encontrado, pulando condição`);
        continue;
      }

      let conditionMet = false;
      const normalizedOperator = normalizeOperator(operador);
      
      switch (normalizedOperator) {
        case 'equal':
          conditionMet = compareValue === valor;
          break;
        case 'greater':
          conditionMet = parseFloat(compareValue) > parseFloat(valor);
          break;
        case 'less':
          conditionMet = parseFloat(compareValue) < parseFloat(valor);
          break;
        case 'greater_equal':
          conditionMet = parseFloat(compareValue) >= parseFloat(valor);
          break;
        case 'less_equal':
          conditionMet = parseFloat(compareValue) <= parseFloat(valor);
          break;
        case 'not_equal':
          conditionMet = compareValue !== valor;
          break;
        case 'between':
          conditionMet = parseFloat(compareValue) >= parseFloat(valor) && parseFloat(compareValue) <= parseFloat(valorFinal || valor);
          break;
        default:
          conditionMet = false;
      }
      
      console.log(`✅ Resultado: ${compareValue} ${normalizedOperator} ${valor} = ${conditionMet}`);
      
      if (conditionMet) {
        console.log(`🎯 Condição atendida:`, condition);
        return condition;
      }
    }
    
    console.log('❌ Nenhuma condição legada atendida');
    return null;
  };

  // Evaluate composite conditions (new format)
  const evaluateCompositeConditions = (conditions: any[]): any | null => {
    if (!conditions || conditions.length === 0) {
      console.log('❌ Nenhuma condição composta para avaliar');
      return null;
    }
    
    console.log('🔍 Avaliando condições compostas:', conditions);
    console.log('📊 Dados disponíveis para comparação:', {
      calculatorResults,
      questionResponses,
      calculatorResult
    });
    
    for (const condition of conditions) {
      console.log('🧪 Testando condição:', condition);
      
      if (!condition.rules || condition.rules.length === 0) {
        console.log('⚠️ Condição sem regras, pulando...');
        continue;
      }
      
      const results = condition.rules.map((rule: any) => {
        const { sourceType, sourceField, operator, value, valueEnd } = rule;
        let compareValue: any;

        console.log(`🔍 Avaliando regra: sourceType=${sourceType}, sourceField=${sourceField}, operator=${operator}, value=${value}`);

        if (sourceType === 'calculation') {
          compareValue = getCompareValue(sourceField, sourceField);
          console.log(`📊 Valor do cálculo '${sourceField}':`, compareValue);
        } else if (sourceType === 'question') {
          compareValue = getCompareValue(sourceField, sourceField);
          console.log(`❓ Resposta da pergunta '${sourceField}':`, compareValue);
        }

        if (compareValue === undefined || compareValue === null) {
          console.warn(`⚠️ Campo ${sourceField} não encontrado para avaliação da regra`);
          return false;
        }

        console.log(`🔢 Comparando: ${compareValue} ${operator} ${value}`);

        let result = false;
        switch (operator) {
          case 'equal':
            result = compareValue === value;
            break;
          case 'not_equal':
            result = compareValue !== value;
            break;
          case 'greater':
            result = parseFloat(compareValue) > parseFloat(value);
            break;
          case 'less':
            result = parseFloat(compareValue) < parseFloat(value);
            break;
          case 'greater_equal':
            result = parseFloat(compareValue) >= parseFloat(value);
            break;
          case 'less_equal':
            result = parseFloat(compareValue) <= parseFloat(value);
            break;
          case 'between':
            result = parseFloat(compareValue) >= parseFloat(value) && parseFloat(compareValue) <= parseFloat(valueEnd);
            break;
          case 'contains':
            result = String(compareValue).includes(String(value));
            break;
          case 'in':
            result = Array.isArray(value) ? value.includes(compareValue) : false;
            break;
          default:
            console.warn(`⚠️ Operador desconhecido: ${operator}`);
            result = false;
        }
        
        console.log(`✅ Resultado da regra: ${result}`);
        return result;
      });

      const finalResult = condition.logic === 'AND' ? 
        results.every(r => r) : 
        results.some(r => r);

      console.log(`🎯 Resultado final da condição '${condition.label}': ${finalResult} (lógica: ${condition.logic})`);
      console.log(`📋 Resultados individuais:`, results);
      
      if (finalResult) {
        console.log(`✅ Condição atendida: ${condition.label}`);
        return condition;
      }
    }
    
    console.log('❌ Nenhuma condição composta foi atendida');
    return null;
  };

  const handleComplete = () => {
    console.log('🎯 ConditionsStepRenderer: Iniciando avaliação de condições');
    console.log('📊 Dados disponíveis:', {
      calculatorResult,
      questionResponses,
      calculatorResults,
      step: step
    });
    
    let matchedCondition = null;
    let conditionIndex = -1;
    
    // Try composite conditions first (new format)
    if (step.compositeConditions && step.compositeConditions.length > 0) {
      console.log('🔍 Avaliando condições compostas:', step.compositeConditions);
      for (let i = 0; i < step.compositeConditions.length; i++) {
        const condition = step.compositeConditions[i];
        const result = evaluateCompositeConditions([condition]);
        if (result) {
          matchedCondition = condition;
          conditionIndex = i;
          console.log(`✅ Condição composta ${i} atendida:`, condition.label);
          break;
        }
      }
    }
    
    // Fallback to legacy conditions
    if (!matchedCondition && step.conditions && step.conditions.length > 0) {
      console.log('🔄 Tentando condições legadas:', step.conditions);
      for (let i = 0; i < step.conditions.length; i++) {
        const condition = step.conditions[i];
        const result = evaluateConditions(calculatorResult || 0, [condition]);
        if (result) {
          matchedCondition = condition;
          conditionIndex = i;
          console.log(`✅ Condição legada ${i} atendida:`, condition.label || condition.campo);
          break;
        }
      }
    }
    
    // Try special conditions (advanced format)
    if (!matchedCondition && step.condicoesEspeciais && step.condicoesEspeciais.length > 0) {
      console.log('🔄 Tentando condições especiais:', step.condicoesEspeciais);
      for (let i = 0; i < step.condicoesEspeciais.length; i++) {
        const condition = step.condicoesEspeciais[i];
        const result = evaluateConditions(calculatorResult || 0, [condition]);
        if (result) {
          matchedCondition = condition;
          conditionIndex = i;
          console.log(`✅ Condição especial ${i} atendida:`, condition.label || condition.campo);
          break;
        }
      }
    }

    console.log('🎯 Condição final escolhida:', matchedCondition);
    console.log('📍 Índice da condição:', conditionIndex);
    setEvaluatedCondition(matchedCondition);
    
    // 🎯 SMART FALLBACK: Se nenhuma condição foi atendida, usar condição padrão (primeira)
    if (conditionIndex === -1) {
      console.warn('⚠️ Nenhuma condição específica atendida, usando fallback inteligente');
      
      // Tentar encontrar uma condição padrão
      const allConditions = step.compositeConditions || step.conditions || step.condicoesEspeciais || [];
      if (allConditions.length > 0) {
        matchedCondition = allConditions[0]; // Usar primeira condição como padrão
        conditionIndex = 0;
        console.log(`🔄 Usando condição padrão (index 0):`, matchedCondition);
      } else {
        console.error('❌ CRITICAL: Nenhuma condição configurada no step!');
        alert('Erro na configuração: Este step não possui condições válidas configuradas.');
        return;
      }
    }
    
    const responseData = {
      nodeId: step.nodeId,
      nodeType: 'conditions',
      condition: matchedCondition,
      conditionId: matchedCondition?.id,
      conditionLabel: matchedCondition?.label,
      conditionIndex: conditionIndex, // Para o processador saber qual caminho seguir
      allData: {
        calculatorResult,
        questionResponses,
        calculatorResults
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Enviando resposta com índice da condição:', responseData);
    onComplete(responseData);
  };

  // Get the relevant calculator result for display
  const getDisplayValue = () => {
    // Find the primary result to show (IMC in this case)
    if (calculatorResults && Object.keys(calculatorResults).length > 0) {
      const primaryKey = Object.keys(calculatorResults)[0]; // Get first result
      const value = calculatorResults[primaryKey];
      return typeof value === 'number' ? value.toFixed(2) : value;
    }
    if (calculatorResult !== undefined) {
      return typeof calculatorResult === 'number' ? calculatorResult.toFixed(2) : calculatorResult;
    }
    return null;
  };

  // Get the condition that would apply (without showing all debugging info)
  const getApplicableCondition = () => {
    let matchedCondition = null;
    
    // Try composite conditions first
    if (step.compositeConditions && step.compositeConditions.length > 0) {
      for (const condition of step.compositeConditions) {
        const result = evaluateCompositeConditions([condition]);
        if (result) {
          matchedCondition = condition;
          break;
        }
      }
    }
    
    // Fallback to legacy conditions
    if (!matchedCondition && step.conditions && step.conditions.length > 0) {
      for (const condition of step.conditions) {
        const result = evaluateConditions(calculatorResult || 0, [condition]);
        if (result) {
          matchedCondition = condition;
          break;
        }
      }
    }
    
    return matchedCondition;
  };

  const displayValue = getDisplayValue();
  const applicableCondition = getApplicableCondition();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {step.title || 'Resultado da Avaliação'}
          </h1>
          {step.description && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {step.description}
            </p>
          )}
        </div>

        <Card className="bg-white dark:bg-[#0E0E0E] backdrop-blur-sm border-0 shadow-xl dark:border-gray-800">
          <CardContent className="p-8">
            {applicableCondition && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8">
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">
                    {applicableCondition.label}
                  </div>
                  {step.descricao && (
                    <div className="text-emerald-600 dark:text-emerald-400 text-lg">
                      {step.descricao}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {!applicableCondition && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-8">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full mx-auto mb-4"></div>
                    <div className="text-gray-600 dark:text-gray-400 text-lg">
                      Analisando seus dados...
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
