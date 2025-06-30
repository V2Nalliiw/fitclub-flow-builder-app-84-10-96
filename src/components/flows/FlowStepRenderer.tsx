
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, FileText, HelpCircle, Clock, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FlowStepRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const FlowStepRenderer: React.FC<FlowStepRendererProps> = ({ 
  step, 
  onComplete, 
  isLoading = false 
}) => {
  const [response, setResponse] = useState<any>({});
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);

  const handleSubmit = () => {
    let finalResponse = response;
    
    if (step.nodeType === 'question' && step.tipoResposta === 'multipla-escolha') {
      finalResponse = { ...response, selectedOptions: multiSelectValues };
    }
    
    onComplete(finalResponse);
  };

  const handleMultiSelectChange = (value: string, checked: boolean) => {
    if (checked) {
      setMultiSelectValues(prev => [...prev, value]);
    } else {
      setMultiSelectValues(prev => prev.filter(v => v !== value));
    }
  };

  const getStepIcon = () => {
    switch (step.nodeType) {
      case 'formStart':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'question':
        return <HelpCircle className="h-6 w-6 text-purple-500" />;
      case 'delay':
        return <Clock className="h-6 w-6 text-orange-500" />;
      case 'formEnd':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const renderStepContent = () => {
    switch (step.nodeType) {
      case 'formStart':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.title || 'Início do Formulário'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description || 'Vamos começar este formulário. Clique em continuar quando estiver pronto.'}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    Carregando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'question':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {step.pergunta || step.title || 'Pergunta'}
              </h3>
              
              {step.tipoResposta === 'texto-livre' && (
                <div className="space-y-2">
                  <Label htmlFor="response">Sua resposta:</Label>
                  <Textarea
                    id="response"
                    placeholder="Digite sua resposta aqui..."
                    value={response.text || ''}
                    onChange={(e) => setResponse({ ...response, text: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              {step.tipoResposta === 'escolha-unica' && step.opcoes && (
                <div className="space-y-4">
                  <Label>Selecione uma opção:</Label>
                  <RadioGroup
                    value={response.selectedOption || ''}
                    onValueChange={(value) => setResponse({ ...response, selectedOption: value })}
                  >
                    {step.opcoes.map((opcao: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcao} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{opcao}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step.tipoResposta === 'multipla-escolha' && step.opcoes && (
                <div className="space-y-4">
                  <Label>Selecione uma ou mais opções:</Label>
                  <div className="space-y-2">
                    {step.opcoes.map((opcao: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${index}`}
                          checked={multiSelectValues.includes(opcao)}
                          onCheckedChange={(checked) => handleMultiSelectChange(opcao, checked as boolean)}
                        />
                        <Label htmlFor={`option-${index}`}>{opcao}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isResponseValid()}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'formEnd':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.title || 'Formulário Concluído'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {step.description || step.mensagemFinal || 'Parabéns! Você concluiu esta seção do formulário.'}
              </p>
              
              {step.tipoConteudo && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conteúdo disponível: {step.tipoConteudo}
                  </p>
                  {step.arquivo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Arquivo: {step.arquivo}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-950/20 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.title || 'Etapa do Formulário'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description || 'Continue para a próxima etapa.'}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    Carregando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  const isResponseValid = () => {
    if (step.nodeType !== 'question') return true;
    
    switch (step.tipoResposta) {
      case 'texto-livre':
        return response.text && response.text.trim().length > 0;
      case 'escolha-unica':
        return response.selectedOption;
      case 'multipla-escolha':
        return multiSelectValues.length > 0;
      default:
        return true;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          {getStepIcon()}
          <span className="text-lg">
            Etapa {step.order || 1} de {step.totalSteps || 1}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};
