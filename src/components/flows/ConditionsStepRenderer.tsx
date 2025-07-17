
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

  console.log('=== DEBUGGING CONDIÇÕES ===');
  console.log('Step:', step);
  console.log('Calculator Result:', calculatorResult);
  console.log('Question Responses:', questionResponses);
  console.log('Calculator Results:', calculatorResults);

  // Evaluate legacy conditions (for backwards compatibility)
  const evaluateConditions = (result: number, conditions: any[]): any | null => {
    if (!conditions || conditions.length === 0) return null;
    
    console.log('Evaluating legacy conditions:', conditions);
    
    for (const condition of conditions) {
      const { campo, operador, valor, valorFinal } = condition;
      let compareValue: any;

      // Look for value in calculator results first (by nomenclatura)
      if (calculatorResults[campo] !== undefined) {
        compareValue = calculatorResults[campo];
        console.log(`Found in calculatorResults: ${campo} = ${compareValue}`);
      } else if (questionResponses[campo] !== undefined) {
        compareValue = questionResponses[campo];
        console.log(`Found in questionResponses: ${campo} = ${compareValue}`);
      } else {
        console.warn(`Field ${campo} not found in any data source`);
        continue;
      }

      console.log(`Evaluating: ${campo} ${operador} ${valor} (current: ${compareValue})`);

      let conditionMet = false;
      
      switch (operador) {
        case 'igual':
          conditionMet = compareValue === valor;
          break;
        case 'maior':
          conditionMet = parseFloat(compareValue) > parseFloat(valor);
          break;
        case 'menor':
          conditionMet = parseFloat(compareValue) < parseFloat(valor);
          break;
        case 'maior_igual':
          conditionMet = parseFloat(compareValue) >= parseFloat(valor);
          break;
        case 'menor_igual':
          conditionMet = parseFloat(compareValue) <= parseFloat(valor);
          break;
        case 'diferente':
          conditionMet = compareValue !== valor;
          break;
        case 'entre':
          conditionMet = parseFloat(compareValue) >= parseFloat(valor) && parseFloat(compareValue) <= parseFloat(valorFinal || valor);
          break;
        default:
          conditionMet = false;
      }

      console.log(`Condition result: ${conditionMet}`);
      
      if (conditionMet) {
        return condition;
      }
    }
    
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
          compareValue = calculatorResults[sourceField];
          console.log(`📊 Valor do cálculo '${sourceField}':`, compareValue);
        } else if (sourceType === 'question') {
          compareValue = questionResponses[sourceField];
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
    <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-500" />
          {step.title || 'Resultado da Avaliação'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step.descricao && (
          <p className="text-gray-600 dark:text-gray-300 text-center">{step.descricao}</p>
        )}
        
        {/* Clean result display */}
        {displayValue && (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {displayValue}
              </div>
              {applicableCondition && (
                <div className="text-lg font-semibold text-primary/80">
                  {applicableCondition.label}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-primary-gradient hover:opacity-90 text-white px-8 py-3 font-medium"
            size="lg"
          >
            {isLoading ? 'Processando...' : 'Continuar'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
