
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, FileText, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { ImprovedFlowDelayTimer } from './ImprovedFlowDelayTimer';
import { EnhancedDocumentDisplay } from './EnhancedDocumentDisplay';
import { UnifiedPatientRenderer } from './UnifiedPatientRenderer';
import { ConditionsStepRenderer } from './ConditionsStepRenderer';
import { SpecialConditionsStepRenderer } from './SpecialConditionsStepRenderer';

interface FlowStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  onGoBack?: () => void;
  isLoading?: boolean;
  canGoBack?: boolean;
  calculatorResult?: number;
  questionResponses?: Record<string, any>;
  calculatorResults?: Record<string, number>;
}

export const FlowStepRenderer: React.FC<FlowStepRendererProps> = ({
  step,
  onComplete,
  onGoBack,
  isLoading = false,
  canGoBack = false,
  calculatorResult,
  questionResponses = {},
  calculatorResults = {}
}) => {
  const [response, setResponse] = useState<any>('');
  const [multipleChoiceResponse, setMultipleChoiceResponse] = useState<string[]>([]);

  const handleSubmit = () => {
    let finalResponse = response;
    
    if (step.tipoResposta === 'multipla-escolha') {
      finalResponse = multipleChoiceResponse;
    }
    
    onComplete({
      nodeId: step.nodeId,
      nodeType: step.nodeType,
      question: step.pergunta,
      answer: finalResponse,
      timestamp: new Date().toISOString()
    });
  };

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    if (checked) {
      setMultipleChoiceResponse(prev => [...prev, option]);
    } else {
      setMultipleChoiceResponse(prev => prev.filter(item => item !== option));
    }
  };

  const renderStepContent = () => {
    switch (step.nodeType) {
      case 'calculator':
        return (
          <UnifiedPatientRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'conditions':
        return (
          <ConditionsStepRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
            calculatorResult={calculatorResult || 0}
            questionResponses={questionResponses}
            calculatorResults={calculatorResults}
          />
        );

      case 'number':
        return (
          <UnifiedPatientRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'question':
        return (
          <UnifiedPatientRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'specialConditions':
        return (
          <SpecialConditionsStepRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'formStart':
        return (
          <UnifiedPatientRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );


      case 'formEnd':
        return (
          <UnifiedPatientRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'delay':
        const executionId = window.location.pathname.split('/').pop() || '';
        return (
          <ImprovedFlowDelayTimer
            step={step}
            executionId={executionId}
            onComplete={() => {
              console.log('⏰ DelayTimer expirado, recarregando...');
              window.location.reload();
            }}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Tipo de etapa não reconhecida: {step.nodeType}
            </p>
          </div>
        );
    }
  };

  const canSubmit = () => {
    if (step.nodeType === 'formStart' || step.nodeType === 'formEnd' || step.nodeType === 'calculator' || step.nodeType === 'conditions' || step.nodeType === 'number' || step.nodeType === 'simpleCalculator' || step.nodeType === 'specialConditions' || step.nodeType === 'delay') {
      return true;
    }
    
    if (step.nodeType === 'question') {
      if (step.tipoResposta === 'multipla-escolha') {
        return multipleChoiceResponse.length > 0;
      }
      return response && response.toString().trim().length > 0;
    }
    
    return false;
  };

  const getButtonText = () => {
    switch (step.nodeType) {
      case 'formStart':
        return 'Continuar';
      case 'formEnd':
        return 'Finalizar';
      case 'question':
        return 'Responder';
      case 'calculator':
        return 'Calcular';
      case 'conditions':
        return 'Continuar';
      case 'delay':
        return 'Continuar';
      default:
        return 'Continuar';
    }
  };

  // Para nós com interface própria
  if (['calculator', 'conditions', 'number', 'question', 'formStart', 'formEnd', 'specialConditions', 'delay'].includes(step.nodeType)) {
    return renderStepContent();
  }

  return (
    <Card className="bg-white dark:bg-[#0E0E0E] backdrop-blur-sm border-0 shadow-lg flow-step-card dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-primary">
            Etapa {step.order || 1}
          </span>
          {canGoBack && onGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-center pt-4 gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isLoading}
            className="bg-primary-gradient hover:opacity-90 text-white px-8 py-3 font-medium"
            size="lg"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                {getButtonText()}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
