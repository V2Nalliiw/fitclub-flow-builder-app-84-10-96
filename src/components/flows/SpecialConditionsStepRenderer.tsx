import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, ArrowRight, CheckCircle } from 'lucide-react';

interface SpecialCondition {
  id: string;
  tipo: 'numerico' | 'pergunta';
  campo: string;
  operador: string;
  valor: string | number;
  valorFinal?: number;
  label: string;
}

interface SpecialConditionsStepRendererProps {
  step: {
    nodeId: string;
    nodeType: string;
    condicoesEspeciais?: SpecialCondition[];
    label?: string;
  };
  onComplete: (response: any) => void;
  isLoading?: boolean;
  flowResponses?: Record<string, any>; // Respostas anteriores do fluxo
}

export const SpecialConditionsStepRenderer: React.FC<SpecialConditionsStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  flowResponses = {}
}) => {
  const [evaluatedCondition, setEvaluatedCondition] = useState<SpecialCondition | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<string>('');

  useEffect(() => {
    evaluateConditions();
  }, [step.condicoesEspeciais, flowResponses]);

  const evaluateConditions = () => {
    if (!step.condicoesEspeciais || step.condicoesEspeciais.length === 0) {
      setEvaluationResult('Nenhuma condição configurada');
      return;
    }

    for (const condition of step.condicoesEspeciais) {
      if (evaluateCondition(condition)) {
        setEvaluatedCondition(condition);
        setEvaluationResult(condition.label);
        return;
      }
    }

    setEvaluationResult('Nenhuma condição atendida');
  };

  const evaluateCondition = (condition: SpecialCondition): boolean => {
    const fieldValue = flowResponses[condition.campo];
    
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    if (condition.tipo === 'numerico') {
      const numValue = typeof fieldValue === 'number' ? fieldValue : parseFloat(fieldValue);
      const conditionValue = typeof condition.valor === 'number' ? condition.valor : parseFloat(condition.valor as string);
      
      if (isNaN(numValue) || isNaN(conditionValue)) {
        return false;
      }

      switch (condition.operador) {
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
          return condition.valorFinal !== undefined && 
                 numValue >= conditionValue && 
                 numValue <= condition.valorFinal;
        default:
          return false;
      }
    } else {
      // Tipo pergunta
      const strValue = String(fieldValue).toLowerCase();
      const conditionValue = String(condition.valor).toLowerCase();

      switch (condition.operador) {
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
  };

  const handleContinue = () => {
    console.log('🎯 ConditionsRenderer: Completando com condição avaliada:', {
      evaluatedCondition,
      evaluationResult,
      conditionMet: evaluatedCondition !== null
    });

    onComplete({
      nodeId: step.nodeId,
      nodeType: step.nodeType,
      evaluatedCondition: evaluatedCondition,
      result: evaluationResult,
      conditionMet: evaluatedCondition !== null,
      conditionId: evaluatedCondition?.id,
      conditionLabel: evaluatedCondition?.label,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="bg-white/90 dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <GitBranch className="h-5 w-5" />
          Avaliação de Condições
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Condições Especiais
          </h3>
        </div>

        {/* Lista de condições configuradas */}
        {step.condicoesEspeciais && step.condicoesEspeciais.length > 0 && (
          <div className="bg-gray-50 dark:bg-[#0E0E0E] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Condições avaliadas:</div>
            <div className="space-y-2">
              {step.condicoesEspeciais.map((condition, index) => (
                <div 
                  key={condition.id || index}
                  className={`p-3 rounded border text-sm ${
                    evaluatedCondition?.id === condition.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                      : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {evaluatedCondition?.id === condition.id && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium">{condition.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {condition.campo} {condition.operador.replace('_', ' ')} {condition.valor}
                    {condition.valorFinal && ` - ${condition.valorFinal}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultado da avaliação */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">
            Resultado da avaliação:
          </div>
          <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            {evaluationResult}
          </div>
          {evaluatedCondition && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ Condição atendida
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="bg-primary-gradient hover:opacity-90 text-white px-8 py-3 font-medium"
            size="lg"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};