
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, FileText, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { DelayTimer } from './DelayTimer';
import { EnhancedDocumentDisplay } from './EnhancedDocumentDisplay';
import { MedicalQuestionnaireStepRenderer } from './MedicalQuestionnaireStepRenderer';
import { ConditionsStepRenderer } from './ConditionsStepRenderer';
import { NumberStepRenderer } from './NumberStepRenderer';
import { SimpleCalculatorStepRenderer } from './SimpleCalculatorStepRenderer';
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
          <MedicalQuestionnaireStepRenderer
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
          <NumberStepRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case 'simpleCalculator':
        return (
          <SimpleCalculatorStepRenderer
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
            calculatorResults={{}}
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
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {step.title || 'Novo Formulário'}
                </h3>
                {step.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {step.description}
                  </p>
                )}
                
                <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    ✅ Formulário pronto para preenchimento
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-medium"
                  size="lg"
                >
                  {isLoading ? 'Processando...' : 'Iniciar Formulário'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'question':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {step.pergunta || step.title}
              </h3>
            </div>

            {step.tipoResposta === 'escolha-unica' && step.opcoes && Array.isArray(step.opcoes) && (
              <RadioGroup value={response} onValueChange={setResponse}>
                <div className="space-y-3">
                  {step.opcoes.map((opcao: string, index: number) => (
                     <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-[#1A1A1A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0E0E0E]/50 transition-colors">
                      <RadioGroupItem value={opcao} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {opcao}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {step.tipoResposta === 'multipla-escolha' && step.opcoes && Array.isArray(step.opcoes) && (
              <div className="space-y-3">
                {step.opcoes.map((opcao: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-[#1A1A1A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0E0E0E]/50 transition-colors">
                    <Checkbox
                      id={`checkbox-${index}`}
                      checked={multipleChoiceResponse.includes(opcao)}
                      onCheckedChange={(checked) => handleMultipleChoiceChange(opcao, !!checked)}
                    />
                    <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {step.tipoResposta === 'texto-livre' && (
              <div className="space-y-3">
                <Label htmlFor="text-response" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sua resposta:
                </Label>
                <Textarea
                  id="text-response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="min-h-[120px]"
                />
              </div>
            )}
          </div>
        );

      case 'formEnd':
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {step.title || 'Formulário Concluído! ✅'}
                </h3>
                
                {step.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {step.description}
                  </p>
                )}

                {/* ✨ EXIBIR ARQUIVOS PARA DOWNLOAD */}
                {step.arquivos && Array.isArray(step.arquivos) && step.arquivos.length > 0 && (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6 border border-emerald-500/20">
                    <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center justify-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Materiais Enviados
                    </h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Seus materiais foram enviados por WhatsApp
                    </p>
                  </div>
                )}

                {step.mensagemFinal && (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6 border border-emerald-500/20">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      {step.mensagemFinal}
                    </p>
                  </div>
                )}

                <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6">
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                    🎉 Parabéns! Você concluiu este formulário com sucesso.
                    {step.delayAmount && step.delayType && (
                      <span className="block mt-2 text-sm">
                        ⏰ Em {step.delayAmount} {step.delayType} você receberá a próxima etapa
                      </span>
                    )}
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
                  size="lg"
                >
                  {isLoading ? 'Processando...' : 'Finalizar'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'delay':
        return (
          <DelayTimer
            availableAt={step.availableAt || new Date().toISOString()}
            onDelayExpired={handleSubmit}
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

  // Para calculadora, condições, delay e novos nós que têm seus próprios botões
  if (step.nodeType === 'calculator' || step.nodeType === 'conditions' || step.nodeType === 'number' || step.nodeType === 'simpleCalculator' || step.nodeType === 'specialConditions' || step.nodeType === 'delay' || step.nodeType === 'formStart' || step.nodeType === 'formEnd') {
    return renderStepContent();
  }

  return (
    <Card className="bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm border-0 shadow-lg">
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
