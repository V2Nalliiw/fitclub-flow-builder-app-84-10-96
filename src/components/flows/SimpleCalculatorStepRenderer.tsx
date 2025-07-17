import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Calculator } from 'lucide-react';

interface SimpleCalculatorStepRendererProps {
  step: {
    nodeId: string;
    nodeType: string;
    operacao?: string;
    camposReferenciados?: string[];
    resultLabel?: string;
    label?: string;
  };
  onComplete: (response: any) => void;
  isLoading?: boolean;
  calculatorResults?: Record<string, number>; // Resultados de campos anteriores
}

export const SimpleCalculatorStepRenderer: React.FC<SimpleCalculatorStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false,
  calculatorResults = {}
}) => {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateResult();
  }, [step.operacao, calculatorResults]);

  const calculateResult = () => {
    if (!step.operacao || !step.camposReferenciados) {
      setError('Operação ou campos não configurados');
      return;
    }

    try {
      let expression = step.operacao;
      
      // Substituir nomenclaturas pelos valores
      step.camposReferenciados.forEach(campo => {
        const value = calculatorResults[campo];
        if (value === undefined || value === null) {
          throw new Error(`Valor para ${campo} não encontrado`);
        }
        expression = expression.replace(new RegExp(campo, 'g'), value.toString());
      });

      // Avaliar a expressão (simples - apenas operações básicas)
      const calculatedResult = Function(`"use strict"; return (${expression})`)();
      
      if (isNaN(calculatedResult)) {
        throw new Error('Resultado inválido');
      }

      setResult(calculatedResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no cálculo');
      setResult(null);
    }
  };

  const handleContinue = () => {
    if (result !== null) {
      onComplete({
        nodeId: step.nodeId,
        nodeType: step.nodeType,
        operation: step.operacao,
        referencedFields: step.camposReferenciados,
        result: result,
        resultLabel: step.resultLabel,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="h-5 w-5" />
          Cálculo Automático
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {step.resultLabel || 'Resultado do Cálculo'}
          </h3>
        </div>


        {/* Resultado */}
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          {error ? (
            <div className="text-red-600 dark:text-red-400">
              <div className="font-semibold">Erro no cálculo:</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : result !== null ? (
            <>
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                {step.resultLabel || 'Resultado'}
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {result.toFixed(2)}
              </div>
            </>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              Calculando...
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={result === null || isLoading}
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