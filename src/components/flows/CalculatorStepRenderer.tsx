import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, ArrowRight, Hash, HelpCircle } from 'lucide-react';

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
  const [calculationResponses, setCalculationResponses] = useState<Record<string, number>>({});
  const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);

  // Combinar todos os campos e ordenar
  const calculatorFields = step.calculatorFields || [];
  const questionFields = step.calculatorQuestionFields || [];
  
  const allFields = [
    ...calculatorFields.map((f: any) => ({ ...f, fieldType: 'calculo' })),
    ...questionFields.map((f: any) => ({ ...f, fieldType: 'pergunta' }))
  ].sort((a, b) => (a.order || 0) - (b.order || 0));

  const currentField = allFields[currentFieldIndex];

  const handleCalculationResponse = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newResponses = {
      ...calculationResponses,
      [currentField.nomenclatura]: numericValue
    };
    setCalculationResponses(newResponses);
    moveToNextField();
  };

  const handleQuestionResponse = (value: any) => {
    const newResponses = {
      ...questionResponses,
      [currentField.nomenclatura]: value
    };
    setQuestionResponses(newResponses);
    moveToNextField();
  };

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const currentValues = questionResponses[currentField.nomenclatura] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((v: string) => v !== option);
    }
    
    const newResponses = {
      ...questionResponses,
      [currentField.nomenclatura]: newValues
    };
    setQuestionResponses(newResponses);
  };

  const moveToNextField = () => {
    if (currentFieldIndex < allFields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      // Calcular resultado apenas se houver fórmula e campos de cálculo
      if (step.formula && calculatorFields.length > 0) {
        const result = calculateFormula(step.formula, calculationResponses);
        setCalculatedResult(result);
      }
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
    console.log('🧮 CalculatorStepRenderer - handleComplete called');
    console.log('📊 calculationResponses:', calculationResponses);
    console.log('❓ questionResponses:', questionResponses);
    console.log('🎯 calculatedResult:', calculatedResult);
    
    // Create fieldResponses mapping nomenclatura to field data for conditions evaluation
    const fieldResponses: Record<string, { value: any, fieldType: string }> = {};
    
    // Add calculation responses
    Object.entries(calculationResponses).forEach(([nomenclatura, value]) => {
      fieldResponses[nomenclatura] = { value, fieldType: 'calculo' };
    });
    
    // Add question responses  
    Object.entries(questionResponses).forEach(([nomenclatura, value]) => {
      fieldResponses[nomenclatura] = { value, fieldType: 'pergunta' };
    });

    const responseData = {
      nodeId: step.nodeId,
      nodeType: 'calculator',
      calculationResponses,
      questionResponses,
      fieldResponses,
      result: calculatedResult,
      // Pass nomenclatura-mapped data for conditions
      calculatorResults: calculationResponses, // Direct mapping by nomenclatura
      questionResults: questionResponses, // Direct mapping by nomenclatura
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending response data:', responseData);
    onComplete(responseData);
  };

  if (showResult) {
    return (
      <Card className="bg-white/90 dark:bg-[#0E0E0E] backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-orange-500" />
            {step.resultLabel || 'Resultado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resultado do Cálculo */}
          {calculatedResult !== null && (
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-orange-600 mb-4">
                {calculatedResult.toFixed(2)}
              </div>
            </div>
          )}
          
          {/* Resumo das Respostas */}
          <div className="space-y-4">
            {calculatorFields.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Valores Informados
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {calculatorFields.map((field: any) => (
                    <div key={field.id}>
                      {field.pergunta}: {field.prefixo}{calculationResponses[field.nomenclatura]}{field.sufixo}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionFields.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Respostas das Perguntas
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {questionFields.map((field: any) => {
                    const response = questionResponses[field.nomenclatura];
                    const displayResponse = Array.isArray(response) ? response.join(', ') : response;
                    return (
                      <div key={field.id}>
                        {field.pergunta}: <strong>{displayResponse}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
    <Card className="bg-white/90 dark:bg-[#0E0E0E] backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-orange-500" />
          {step.title}
        </CardTitle>
        <div className="text-sm text-gray-500">
          {currentField.fieldType === 'calculo' ? 'Campo de Cálculo' : 'Pergunta'} {currentFieldIndex + 1} de {allFields.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {currentField.fieldType === 'calculo' ? (
              <Hash className="h-5 w-5 text-blue-600" />
            ) : (
              <HelpCircle className="h-5 w-5 text-green-600" />
            )}
            <Label className="text-lg">{currentField.pergunta}</Label>
          </div>
          
          {/* Renderização baseada no tipo de campo */}
          {currentField.fieldType === 'calculo' ? (
            /* Campo de Cálculo */
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
                    handleCalculationResponse(target.value);
                  }
                }}
                autoFocus
              />
              {currentField.sufixo && (
                <span className="text-gray-600">{currentField.sufixo}</span>
              )}
            </div>
          ) : currentField.questionType === 'escolha-unica' ? (
            /* Pergunta com Escolha Única */
            <Select onValueChange={handleQuestionResponse}>
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Selecione uma opção..." />
              </SelectTrigger>
              <SelectContent>
                {currentField.opcoes.map((opcao: string) => (
                  <SelectItem key={opcao} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            /* Pergunta com Múltipla Escolha */
            <div className="space-y-3">
              {currentField.opcoes.map((opcao: string) => (
                <div key={opcao} className="flex items-center space-x-2">
                  <Checkbox
                    id={opcao}
                    onCheckedChange={(checked) => handleMultipleChoiceChange(opcao, checked as boolean)}
                  />
                  <Label htmlFor={opcao} className="text-base">
                    {opcao}
                  </Label>
                </div>
              ))}
              
              <Button
                onClick={() => {
                  const currentValues = questionResponses[currentField.nomenclatura] || [];
                  handleQuestionResponse(currentValues);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white mt-4"
                size="lg"
                disabled={!questionResponses[currentField.nomenclatura]?.length}
              >
                Próxima Pergunta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Botão para campos de cálculo e escolha única */}
          {(currentField.fieldType === 'calculo' || currentField.questionType === 'escolha-unica') && (
            <Button
              onClick={() => {
                if (currentField.fieldType === 'calculo') {
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                  if (input) {
                    handleCalculationResponse(input.value);
                  }
                }
                // Para escolha única, o onClick do Select já chama handleQuestionResponse
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              size="lg"
              disabled={currentField.questionType === 'escolha-unica' && !questionResponses[currentField.nomenclatura]}
            >
              {currentFieldIndex < allFields.length - 1 ? 'Próximo Campo' : 'Finalizar'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentFieldIndex + 1) / allFields.length) * 100}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};