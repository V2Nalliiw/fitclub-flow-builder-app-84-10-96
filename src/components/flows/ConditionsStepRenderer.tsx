
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

  return (
    <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-blue-500" />
          {step.title || 'Avaliação de Condições'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step.descricao && (
          <p className="text-gray-600 dark:text-gray-300">{step.descricao}</p>
        )}
        
        {/* Show calculation result if available */}
        {calculatorResult !== undefined && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Resultado do Cálculo:
            </h4>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {calculatorResult}
            </div>
          </div>
        )}

        {/* Show available data for debugging */}
        {Object.keys(calculatorResults).length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Dados de Cálculo Disponíveis:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(calculatorResults).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-blue-700 dark:text-blue-300">{key}:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(questionResponses).length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Respostas das Perguntas:
            </h4>
            <div className="space-y-2">
              {Object.entries(questionResponses).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-green-700 dark:text-green-300">{key}:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Show conditions that will be evaluated */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
            Condições Configuradas:
          </h4>
          
          {/* Legacy conditions */}
          {step.conditions && step.conditions.length > 0 && (
            <div className="space-y-2">
              {step.conditions.map((condition: any, index: number) => {
                const isMatched = evaluatedCondition?.id === condition.id;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isMatched
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isMatched ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">
                        {condition.campo} {condition.operador} {condition.valor}
                        {condition.valorFinal && ` e ${condition.valorFinal}`}
                      </span>
                    </div>
                    <Badge variant={isMatched ? 'default' : 'secondary'}>
                      {condition.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* Composite conditions */}
          {step.compositeConditions && step.compositeConditions.length > 0 && (
            <div className="space-y-2">
              {step.compositeConditions.map((condition: any, index: number) => {
                const isMatched = evaluatedCondition?.id === condition.id;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isMatched
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isMatched ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">
                        {condition.rules?.length || 0} regra(s) - {condition.logic}
                      </span>
                    </div>
                    <Badge variant={isMatched ? 'default' : 'secondary'}>
                      {condition.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 font-medium"
            size="lg"
          >
            {isLoading ? 'Avaliando...' : 'Continuar'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
