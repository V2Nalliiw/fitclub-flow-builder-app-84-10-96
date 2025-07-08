
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowRight } from 'lucide-react';

interface CalculatorStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const CalculatorStepRenderer: React.FC<CalculatorStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false
}) => {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);

  const fields = step.calculatorFields || [];
  const currentField = fields[currentFieldIndex];

  const handleFieldResponse = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newResponses = {
      ...responses,
      [currentField.nomenclatura]: numericValue
    };
    setResponses(newResponses);

    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      // Calcular resultado
      const result = calculateFormula(step.formula, newResponses);
      setCalculatedResult(result);
      setShowResult(true);
    }
  };

  const calculateFormula = (formula: string, values: Record<string, number>): number => {
    try {
      let processedFormula = formula;
      
      // Substituir nomenclaturas pelos valores
      Object.entries(values).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      });

      // Processar operações especiais como ²
      processedFormula = processedFormula.replace(/²/g, '**2');
      
      // Usar Function para avaliar a expressão de forma segura
      const result = new Function('return ' + processedFormula)();
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Erro no cálculo:', error);
      return 0;
    }
  };

  const handleComplete = () => {
    onComplete({
      nodeId: step.nodeId,
      nodeType: 'calculator',
      responses,
      result: calculatedResult,
      timestamp: new Date().toISOString()
    });
  };

  if (showResult) {
    return (
      <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-orange-500" />
            {step.resultLabel || 'Resultado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-orange-600 mb-4">
              {calculatedResult?.toFixed(2)}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <h4 className="font-semibold">Valores informados:</h4>
              {fields.map((field: any) => (
                <div key={field.id}>
                  {field.pergunta}: {field.prefixo}{responses[field.nomenclatura]}{field.sufixo}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 font-medium"
              size="lg"
            >
              {isLoading ? 'Processando...' : 'Continuar'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentField) {
    return <div>Erro: Campo não encontrado</div>;
  }

  return (
    <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-orange-500" />
          {step.title}
        </CardTitle>
        <div className="text-sm text-gray-500">
          Pergunta {currentFieldIndex + 1} de {fields.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-lg">{currentField.pergunta}</Label>
          </div>
          
          <div className="flex items-center gap-2">
            {currentField.prefixo && (
              <span className="text-gray-600">{currentField.prefixo}</span>
            )}
            <Input
              type={currentField.tipo === 'decimal' ? 'number' : 'number'}
              step={currentField.tipo === 'decimal' ? '0.01' : '1'}
              placeholder="Digite o valor..."
              className="text-lg text-center"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  handleFieldResponse(target.value);
                }
              }}
              autoFocus
            />
            {currentField.sufixo && (
              <span className="text-gray-600">{currentField.sufixo}</span>
            )}
          </div>

          <Button
            onClick={() => {
              const input = document.querySelector('input[type="number"]') as HTMLInputElement;
              if (input) {
                handleFieldResponse(input.value);
              }
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            size="lg"
          >
            {currentFieldIndex < fields.length - 1 ? 'Próxima Pergunta' : 'Calcular'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentFieldIndex + 1) / fields.length) * 100}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};
