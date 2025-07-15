import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, CheckCircle2, Activity } from 'lucide-react';

interface MedicalQuestionnaireStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const MedicalQuestionnaireStepRenderer: React.FC<MedicalQuestionnaireStepRendererProps> = ({
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
    setTimeout(() => {
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
    }, 300); // Smooth transition
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
    console.log('🧮 MedicalQuestionnaire - handleComplete called');
    
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
      calculatorResults: calculationResponses,
      questionResults: questionResponses,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending response data:', responseData);
    onComplete(responseData);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Avaliação Concluída
            </h3>
            
            {calculatedResult !== null && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 mb-6">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {calculatedResult.toFixed(2)}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.resultLabel || 'Resultado da avaliação'}
                </p>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Seus dados foram registrados com sucesso. Agradecemos por responder o questionário médico.
            </p>

            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 font-medium"
              size="lg"
            >
              {isLoading ? 'Processando...' : 'Continuar'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentField) {
    return <div>Erro: Campo não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Questionário Médico
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pergunta {currentFieldIndex + 1} de {allFields.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentFieldIndex + 1) / allFields.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentField.pergunta}
              </Label>
            </div>
            
            {/* Answer Input */}
            <div className="space-y-4">
              {currentField.fieldType === 'calculo' ? (
                /* Campo de Cálculo */
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {currentField.prefixo && (
                      <span className="text-gray-600 font-medium">{currentField.prefixo}</span>
                    )}
                    <Input
                      type={currentField.tipo === 'decimal' ? 'number' : 'number'}
                      step={currentField.tipo === 'decimal' ? '0.01' : '1'}
                      placeholder="Digite..."
                      className="text-xl text-center border-2 border-gray-200 focus:border-blue-500 rounded-xl py-4"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            handleCalculationResponse(target.value);
                          }
                        }
                      }}
                      autoFocus
                    />
                    {currentField.sufixo && (
                      <span className="text-gray-600 font-medium">{currentField.sufixo}</span>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleCalculationResponse(input.value);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    size="lg"
                  >
                    Próxima Pergunta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : currentField.questionType === 'escolha-unica' ? (
                /* Pergunta com Escolha Única */
                <div className="space-y-3">
                  {currentField.opcoes.map((opcao: string, index: number) => (
                    <Button
                      key={opcao}
                      variant="outline"
                      onClick={() => handleQuestionResponse(opcao)}
                      className="w-full p-4 text-left justify-start border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all duration-200"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3" />
                      {opcao}
                    </Button>
                  ))}
                </div>
              ) : (
                /* Pergunta com Múltipla Escolha */
                <div className="space-y-4">
                  <div className="space-y-3">
                    {currentField.opcoes.map((opcao: string) => (
                      <div key={opcao} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <Checkbox
                          id={opcao}
                          onCheckedChange={(checked) => handleMultipleChoiceChange(opcao, checked as boolean)}
                          className="w-5 h-5"
                        />
                        <Label htmlFor={opcao} className="text-base font-medium cursor-pointer flex-1">
                          {opcao}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      const currentValues = questionResponses[currentField.nomenclatura] || [];
                      handleQuestionResponse(currentValues);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    size="lg"
                    disabled={!questionResponses[currentField.nomenclatura]?.length}
                  >
                    Próxima Pergunta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};