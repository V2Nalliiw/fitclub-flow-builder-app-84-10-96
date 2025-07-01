
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentDownload } from './DocumentDownload';
import { 
  HelpCircle, 
  Calculator, 
  FileText, 
  MessageSquare,
  CheckSquare,
  List,
  Hash,
  Type,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface FlowStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
  calculatorResult?: number;
}

export const FlowStepRenderer: React.FC<FlowStepRendererProps> = ({ 
  step, 
  onComplete, 
  isLoading = false,
  calculatorResult = 0
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});

  if (!step) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Etapa não encontrada</p>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    onComplete(responses);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-6 w-6 text-white" />;
      case 'calculator':
        return <Calculator className="h-6 w-6 text-white" />;
      case 'document':
        return <FileText className="h-6 w-6 text-white" />;
      case 'conditions':
        return <CheckSquare className="h-6 w-6 text-white" />;
      default:
        return <MessageSquare className="h-6 w-6 text-white" />;
    }
  };

  const getStepTitle = (type: string) => {
    switch (type) {
      case 'question':
        return 'Questionário';
      case 'calculator':
        return 'Calculadora';
      case 'document':
        return 'Material Informativo';
      case 'conditions':
        return 'Avaliação de Condições';
      default:
        return 'Etapa do Formulário';
    }
  };

  const renderQuestionStep = () => {
    const questions = step.questions || [];
    
    return (
      <div className="space-y-6">
        {questions.map((question: any, index: number) => (
          <div key={question.id || index} className="space-y-3">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {question.type === 'text' && (
              <Input
                placeholder={question.placeholder || 'Digite sua resposta...'}
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full"
              />
            )}
            
            {question.type === 'textarea' && (
              <Textarea
                placeholder={question.placeholder || 'Digite sua resposta...'}
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                rows={4}
                className="w-full resize-none"
              />
            )}
            
            {question.type === 'select' && (
              <Select
                value={responses[question.id] || ''}
                onValueChange={(value) => handleInputChange(question.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção..." />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option: any, optIndex: number) => (
                    <SelectItem key={optIndex} value={option.value || option}>
                      {option.label || option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {question.type === 'radio' && (
              <RadioGroup
                value={responses[question.id] || ''}
                onValueChange={(value) => handleInputChange(question.id, value)}
                className="space-y-2"
              >
                {question.options?.map((option: any, optIndex: number) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value || option} 
                      id={`${question.id}-${optIndex}`} 
                    />
                    <Label 
                      htmlFor={`${question.id}-${optIndex}`}
                      className="text-sm font-normal"
                    >
                      {option.label || option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {question.type === 'checkbox' && (
              <div className="space-y-2">
                {question.options?.map((option: any, optIndex: number) => {
                  const currentValues = responses[question.id] || [];
                  const isChecked = currentValues.includes(option.value || option);
                  
                  return (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${optIndex}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const value = option.value || option;
                          let newValues = [...currentValues];
                          
                          if (checked) {
                            if (!newValues.includes(value)) {
                              newValues.push(value);
                            }
                          } else {
                            newValues = newValues.filter(v => v !== value);
                          }
                          
                          handleInputChange(question.id, newValues);
                        }}
                      />
                      <Label 
                        htmlFor={`${question.id}-${optIndex}`}
                        className="text-sm font-normal"
                      >
                        {option.label || option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
            
            {question.type === 'number' && (
              <Input
                type="number"
                placeholder={question.placeholder || 'Digite um número...'}
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full"
              />
            )}
            
            {question.type === 'date' && (
              <Input
                type="date"
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCalculatorStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-semibold">Resultado do Cálculo</h3>
              <p className="text-white/90">Baseado nas suas respostas anteriores</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold mb-2">
              {calculatorResult.toFixed(1)}
            </div>
            <p className="text-white/90">
              {step.title || 'Resultado da calculadora'}
            </p>
          </div>
        </div>

        {step.description && (
          <div className="bg-gray-50 dark:bg-gray-950/50 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentStep = () => {
    return (
      <div className="space-y-6">
        {step.title && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {step.title}
            </h3>
            {step.description && (
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            )}
          </div>
        )}

        {step.document && (
          <DocumentDownload 
            document={step.document}
            title={step.title || 'Material Informativo'}
          />
        )}

        {step.content && (
          <div className="bg-gray-50 dark:bg-gray-950/50 rounded-lg p-6">
            <div className="prose dark:prose-invert max-w-none">
              {typeof step.content === 'string' ? (
                <p>{step.content}</p>
              ) : (
                step.content
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConditionsStep = () => {
    const conditions = step.conditions || [];
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-semibold">Avaliação de Condições</h3>
              <p className="text-white/90">Baseado no resultado: {calculatorResult.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {conditions.map((condition: any, index: number) => {
            const isActive = calculatorResult >= (condition.minValue || 0) && 
                           calculatorResult <= (condition.maxValue || Infinity);
            
            return (
              <div
                key={index}
                className={`rounded-lg border-2 p-4 transition-all ${
                  isActive 
                    ? 'border-[#5D8701] bg-[#5D8701]/5 dark:bg-[#5D8701]/10' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    isActive ? 'bg-[#5D8701]' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      isActive 
                        ? 'text-[#5D8701] dark:text-[#5D8701]' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {condition.title}
                    </h4>
                    <p className={`text-sm ${
                      isActive 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {condition.description}
                    </p>
                    {condition.range && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Faixa: {condition.range}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step.type) {
      case 'question':
        return renderQuestionStep();
      case 'calculator':
        return renderCalculatorStep();
      case 'document':
        return renderDocumentStep();
      case 'conditions':
        return renderConditionsStep();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Tipo de etapa não reconhecido: {step.type}</p>
          </div>
        );
    }
  };

  const isStepComplete = () => {
    if (step.type === 'document' || step.type === 'calculator' || step.type === 'conditions') {
      return true;
    }
    
    if (step.type === 'question') {
      const questions = step.questions || [];
      const requiredQuestions = questions.filter((q: any) => q.required);
      
      return requiredQuestions.every((q: any) => {
        const response = responses[q.id];
        return response !== undefined && response !== '' && response !== null;
      });
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full flex items-center justify-center">
          {getStepIcon(step.type)}
        </div>
        <div>
          <Badge variant="outline" className="mb-2">
            {getStepTitle(step.type)}
          </Badge>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {step.title || 'Etapa do Formulário'}
          </h2>
          {step.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {step.description}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Step Content */}
      <div className="min-h-[200px]">
        {renderStepContent()}
      </div>

      {/* Action Button */}
      {(step.type === 'question' || step.type === 'document' || step.type === 'calculator' || step.type === 'conditions') && (
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isStepComplete()}
            className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white px-8 py-3 text-lg min-w-[120px]"
          >
            {isLoading ? (
              'Processando...'
            ) : step.type === 'document' ? (
              'Continuar'
            ) : step.type === 'calculator' || step.type === 'conditions' ? (
              'Prosseguir'
            ) : (
              'Enviar Respostas'
            )}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
