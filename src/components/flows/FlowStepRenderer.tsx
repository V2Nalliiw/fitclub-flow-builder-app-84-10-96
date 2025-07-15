
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, FileText, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { EnhancedDocumentDisplay } from './EnhancedDocumentDisplay';
import { CalculatorStepRenderer } from './CalculatorStepRenderer';
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
}

export const FlowStepRenderer: React.FC<FlowStepRendererProps> = ({
  step,
  onComplete,
  onGoBack,
  isLoading = false,
  canGoBack = false,
  calculatorResult
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
          <CalculatorStepRenderer
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
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.title}
              </h3>
              {step.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {step.description}
                </p>
              )}
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-center font-medium">
                ✅ Clique em "Continuar" para iniciar este formulário
              </p>
            </div>
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
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.title || 'Formulário Concluído'}
              </h3>
              {step.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {step.description}
                </p>
              )}
            </div>

            {/* ✨ EXIBIR ARQUIVOS PARA DOWNLOAD */}
            {step.arquivos && Array.isArray(step.arquivos) && step.arquivos.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800/50">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Seus materiais estão prontos para download
                </h4>
                <div className="space-y-3">
                  {step.arquivos.map((arquivo: any, index: number) => (
                    <EnhancedDocumentDisplay
                      key={index}
                      fileName={arquivo.original_filename || arquivo.nome || 'Arquivo'}
                      fileUrl={arquivo.file_url || arquivo.url}
                      fileType={arquivo.file_type || arquivo.tipo || 'application/pdf'}
                      title={arquivo.original_filename || arquivo.nome || 'Material de Tratamento'}
                      description="Conteúdo complementar para seu acompanhamento"
                    />
                  ))}
                </div>
              </div>
            )}

            {step.mensagemFinal && (
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-6 border border-primary/20 dark:border-primary/30">
                <p className="text-primary dark:text-primary text-center font-medium">
                  {step.mensagemFinal}
                </p>
              </div>
            )}

            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
              <p className="text-primary dark:text-primary text-center font-medium">
                🎉 Clique em "Finalizar" para concluir esta etapa
                {step.delayAmount && step.delayType && (
                  <span className="block mt-2 text-sm">
                    ⏰ Após finalizar, aguarde {step.delayAmount} {step.delayType} para a próxima etapa
                  </span>
                )}
              </p>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aguardando próxima etapa
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                O sistema está processando um intervalo de tempo programado.
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-2" />
                <span className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                  Intervalo Programado
                </span>
              </div>
              {step.delayAmount && step.delayType && (
                <p className="text-orange-700 dark:text-orange-300 text-center mb-4">
                  📅 Aguardar {step.delayAmount} {step.delayType}
                </p>
              )}
              <p className="text-orange-600 dark:text-orange-400 text-center text-sm">
                Este intervalo foi programado pela clínica para otimizar seu tratamento.
                Você receberá uma notificação quando a próxima etapa estiver disponível.
              </p>
            </div>
            
            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
              <p className="text-primary dark:text-primary text-center font-medium">
                ✅ Clique em "Continuar" para processar este intervalo
              </p>
            </div>
          </div>
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

  // Para calculadora, condições e novos nós que têm seus próprios botões
  if (step.nodeType === 'calculator' || step.nodeType === 'conditions' || step.nodeType === 'number' || step.nodeType === 'simpleCalculator' || step.nodeType === 'specialConditions') {
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
