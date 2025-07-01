
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, ArrowRight } from 'lucide-react';

interface ConditionsStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
  calculatorResult?: number;
}

export const ConditionsStepRenderer: React.FC<ConditionsStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  calculatorResult = 0
}) => {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

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

  const handleComplete = () => {
    const conditions = step.conditions || [];
    const matchedCondition = evaluateConditions(calculatorResult, conditions);
    
    onComplete({
      nodeId: step.nodeId,
      nodeType: 'conditions',
      result: calculatorResult,
      matchedCondition: matchedCondition,
      conditionLabel: matchedCondition?.label || 'Nenhuma condição atendida',
      timestamp: new Date().toISOString()
    });
  };

  const conditions = step.conditions || [];
  const matchedCondition = evaluateConditions(calculatorResult, conditions);

  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-purple-500" />
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
          
          {conditions.map((condition: any, index: number) => {
            const isMatched = matchedCondition?.id === condition.id;
            
            return (
              <div
                key={condition.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isMatched 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {condition.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {condition.operador === 'entre' 
                        ? `${condition.campo} entre ${condition.valor} e ${condition.valorFinal}`
                        : `${condition.campo} ${condition.operador} ${condition.valor}`
                      }
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isMatched
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Resultado da Avaliação:
            </h4>
            <p className="text-green-700 dark:text-green-300">
              {matchedCondition.label}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 font-medium"
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
