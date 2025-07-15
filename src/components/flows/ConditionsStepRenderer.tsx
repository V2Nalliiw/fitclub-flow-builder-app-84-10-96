
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, ArrowRight, Hash, HelpCircle } from 'lucide-react';

interface ConditionsStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
  calculatorResult?: number;
  questionResponses?: Record<string, any>; // Respostas de perguntas anteriores
}

export const ConditionsStepRenderer: React.FC<ConditionsStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  calculatorResult = 0,
  questionResponses = {}
}) => {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  // Avaliação de condições legadas (compatibilidade)
  const evaluateConditions = (result: number, conditions: any[]) => {
    for (const condition of conditions) {
      const fieldValue = result; // Usando o resultado da calculadora
      
      switch (condition.operador) {
        case 'igual':
          if (fieldValue === condition.valor) return condition;
          break;
        case 'maior':
          if (fieldValue > condition.valor) return condition;
          break;
        case 'menor':
          if (fieldValue < condition.valor) return condition;
          break;
        case 'maior_igual':
          if (fieldValue >= condition.valor) return condition;
          break;
        case 'menor_igual':
          if (fieldValue <= condition.valor) return condition;
          break;
        case 'diferente':
          if (fieldValue !== condition.valor) return condition;
          break;
        case 'entre':
          if (fieldValue >= condition.valor && fieldValue <= (condition.valorFinal || 0)) return condition;
          break;
      }
    }
    return null;
  };

  // Avaliação de condições compostas
  const evaluateCompositeConditions = (conditions: any[]) => {
    for (const condition of conditions) {
      const ruleResults = condition.rules.map((rule: any) => evaluateRule(rule));
      
      const conditionMet = condition.logic === 'AND' 
        ? ruleResults.every(result => result)
        : ruleResults.some(result => result);
        
      if (conditionMet) {
        return condition;
      }
    }
    return null;
  };

  // Avaliação de uma regra individual
  const evaluateRule = (rule: any) => {
    let fieldValue: any;
    
    // Obter valor baseado na fonte
    if (rule.sourceType === 'calculation') {
      fieldValue = calculatorResult;
    } else if (rule.sourceType === 'question') {
      fieldValue = questionResponses[rule.sourceField];
    }
    
    // Aplicar operador
    switch (rule.operator) {
      case 'equal':
        return fieldValue === rule.value;
      case 'not_equal':
        return fieldValue !== rule.value;
      case 'greater':
        return parseFloat(fieldValue) > parseFloat(rule.value);
      case 'less':
        return parseFloat(fieldValue) < parseFloat(rule.value);
      case 'greater_equal':
        return parseFloat(fieldValue) >= parseFloat(rule.value);
      case 'less_equal':
        return parseFloat(fieldValue) <= parseFloat(rule.value);
      case 'between':
        return parseFloat(fieldValue) >= parseFloat(rule.value) && parseFloat(fieldValue) <= parseFloat(rule.valueEnd);
      case 'contains':
        return String(fieldValue).includes(String(rule.value));
      case 'in':
        return Array.isArray(fieldValue) ? fieldValue.includes(rule.value) : false;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    // Verificar se há condições compostas ou legadas
    const compositeConditions = step.compositeConditions || [];
    const legacyConditions = step.conditions || [];
    
    let matchedCondition = null;
    
    if (compositeConditions.length > 0) {
      matchedCondition = evaluateCompositeConditions(compositeConditions);
    } else if (legacyConditions.length > 0) {
      matchedCondition = evaluateConditions(calculatorResult, legacyConditions);
    }
    
    onComplete({
      nodeId: step.nodeId,
      nodeType: 'conditions',
      result: calculatorResult,
      questionResponses,
      matchedCondition: matchedCondition,
      conditionLabel: matchedCondition?.label || 'Nenhuma condição atendida',
      timestamp: new Date().toISOString()
    });
  };

  // Determinar que tipo de condições usar
  const compositeConditions = step.compositeConditions || [];
  const legacyConditions = step.conditions || [];
  
  const matchedCondition = compositeConditions.length > 0 
    ? evaluateCompositeConditions(compositeConditions)
    : evaluateConditions(calculatorResult, legacyConditions);

  return (
    <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          {step.title || 'Avaliação de Condições'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <div className="text-2xl font-bold text-gray-800 mb-4">
            Resultado: {calculatorResult.toFixed(2)}
          </div>
          
          {step.description && (
            <p className="text-gray-600 mb-6">{step.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Condições Avaliadas:</h3>
          
          {/* Renderizar condições compostas */}
          {compositeConditions.length > 0 && compositeConditions.map((condition: any, index: number) => {
            const isMatched = matchedCondition?.id === condition.id;
            
            return (
              <div
                key={condition.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isMatched 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-none dark:bg-[#0E0E0E]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {condition.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {condition.rules.length} regras com lógica {condition.logic}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isMatched
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isMatched ? '✓ Atendida' : 'Não atendida'}
                  </div>
                </div>
                
                {/* Mostrar regras */}
                <div className="space-y-2">
                  {condition.rules.map((rule: any, ruleIndex: number) => {
                    const ruleResult = evaluateRule(rule);
                    const sourceIcon = rule.sourceType === 'calculation' ? '🧮' : '❓';
                    
                    return (
                      <div key={rule.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${ruleResult ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{sourceIcon}</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {rule.sourceField} {rule.operator} {rule.value}
                          {rule.valueEnd && ` - ${rule.valueEnd}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Renderizar condições legadas */}
          {legacyConditions.length > 0 && legacyConditions.map((condition: any, index: number) => {
            const isMatched = matchedCondition?.id === condition.id;
            
            return (
              <div
                key={condition.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isMatched 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-none dark:bg-[#0E0E0E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {condition.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <Hash className="inline h-3 w-3 mr-1" />
                      {condition.operador === 'entre' 
                        ? `${condition.campo} entre ${condition.valor} e ${condition.valorFinal}`
                        : `${condition.campo} ${condition.operador} ${condition.valor}`
                      }
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isMatched
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isMatched ? '✓ Atendida' : 'Não atendida'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {matchedCondition && (
          <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/20 dark:border-primary/30">
            <h4 className="font-semibold text-primary dark:text-primary mb-2">
              Resultado da Avaliação:
            </h4>
            <p className="text-primary dark:text-primary">
              {matchedCondition.label}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4">
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
