import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle2, Heart, FileText, Clock, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImprovedFlowDelayTimer } from './ImprovedFlowDelayTimer';
import { FlowEndDisplay } from './FlowEndDisplay';
import { FlowEndNode } from './FlowEndNode';

interface UnifiedPatientRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const UnifiedPatientRenderer: React.FC<UnifiedPatientRendererProps> = ({
  step,
  onComplete,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [multipleChoiceResponse, setMultipleChoiceResponse] = useState<string[]>([]);
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [autoProgressTimer, setAutoProgressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Auto-trigger para FormEnd e FormStart
  useEffect(() => {
    if (step.nodeType === 'formEnd') {
      handleFormEndWhatsApp();
    } else if (step.nodeType === 'formStart') {
      // FormStart reconhecido - progride automaticamente após mostrar boas-vindas
      console.log('🎉 FormStart: Reconhecido! Mostrando boas-vindas e progredindo automaticamente');
      const timer = setTimeout(() => {
        handleComplete();
      }, 3000); // 3 segundos para ler a mensagem de boas-vindas
      
      return () => clearTimeout(timer);
    }
  }, [step.nodeType]);


  const handleFormEndWhatsApp = async () => {
    console.log('🏁 FormEnd: Enviando materiais WhatsApp automaticamente');
    setWhatsappStatus('sending');
    
    try {
      // Buscar executionId da URL
      const executionId = window.location.pathname.split('/').pop();
      
      if (!executionId) {
        console.error('❌ FormEnd: ExecutionId não encontrado');
        setWhatsappStatus('error');
        return;
      }

      // Buscar dados da execução
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('patient_id')
        .eq('id', executionId)
        .single();

      if (!execution) {
        console.error('❌ FormEnd: Execução não encontrada');
        setWhatsappStatus('error');
        return;
      }

      // Normalizar arquivos se existirem
      const arquivosNormalizados = (step.arquivos || []).map((arquivo: any) => {
        let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
        
        // Corrigir URLs duplicadas
        if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
          const parts = cleanUrl.split('https://');
          cleanUrl = 'https://' + parts[parts.length - 1];
        }
        
        // Forçar uso apenas do bucket clinic-materials
        if (cleanUrl.includes('/flow-documents/')) {
          cleanUrl = cleanUrl.replace('/flow-documents/', '/clinic-materials/');
        }
        
        return {
          id: arquivo.id || arquivo.document_id,
          nome: arquivo.original_filename || arquivo.filename || arquivo.nome || 'Arquivo',
          url: cleanUrl,
          tipo: arquivo.file_type || arquivo.tipo || 'application/octet-stream',
          tamanho: arquivo.file_size || arquivo.tamanho || 0,
          original_filename: arquivo.original_filename || arquivo.filename || arquivo.nome,
          file_url: cleanUrl,
          file_type: arquivo.file_type || arquivo.tipo,
          file_size: arquivo.file_size || arquivo.tamanho
        };
      });

      // Enviar materiais se houver arquivos
      if (arquivosNormalizados.length > 0) {
        const { data: response, error } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            patientId: execution.patient_id,
            executionId: executionId,
            files: arquivosNormalizados
          }
        });

        if (error) {
          console.error('❌ FormEnd: Erro ao enviar WhatsApp:', error);
          setWhatsappStatus('error');
          toast({
            title: "Erro no WhatsApp",
            description: "Não foi possível enviar os materiais",
            variant: "destructive",
          });
        } else {
          console.log('✅ FormEnd: WhatsApp enviado com sucesso:', response);
          setWhatsappStatus('sent');
          toast({
            title: "Materiais Enviados!",
            description: "Arquivos foram enviados por WhatsApp",
          });
        }
      } else {
        console.log('📝 FormEnd: Nenhum arquivo para enviar');
        setWhatsappStatus('sent');
      }
      
      // Auto-progredir após 3 segundos
      const timer = setTimeout(() => {
        handleComplete();
      }, 3000);
      setAutoProgressTimer(timer);
      
    } catch (error) {
      console.error('❌ FormEnd: Erro crítico:', error);
      setWhatsappStatus('error');
      toast({
        title: "Erro",
        description: "Falha ao enviar materiais WhatsApp",
        variant: "destructive",
      });
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
      }
    };
  }, [autoProgressTimer]);

  const prepareFields = () => {
    switch (step.nodeType) {
      case 'calculator':
        const calculatorFields = step.calculatorFields || [];
        const questionFields = step.calculatorQuestionFields || [];
        console.log('🔢 Preparando campos da calculadora:', { calculatorFields, questionFields });
        
        // Combinar todos os campos e ordenar
        const allFields = [
          ...calculatorFields.map((f: any, index: number) => ({ 
            ...f, 
            fieldType: 'calculo',
            order: f.order !== undefined ? f.order : index
          })),
          ...questionFields.map((f: any, index: number) => ({ 
            ...f, 
            fieldType: 'pergunta',
            order: f.order !== undefined ? f.order : (calculatorFields.length + index)
          }))
        ].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        console.log('📋 Campos ordenados:', allFields);
        return allFields;
      
      case 'number':
        return [{
          nomenclatura: step.nomenclatura,
          pergunta: step.label || `Digite ${step.nomenclatura}`,
          fieldType: 'numero',
          tipo: step.tipoNumero,
          prefixo: step.prefixo,
          sufixo: step.sufixo
        }];
      
      case 'question':
        return [{
          nomenclatura: 'resposta',
          pergunta: step.pergunta || step.title,
          fieldType: 'pergunta',
          questionType: step.tipoResposta,
          opcoes: step.opcoes
        }];
      
      default:
        return [];
    }
  };

  const allFields = prepareFields();
  const currentField = allFields[currentFieldIndex];

  const handleResponse = (value: any) => {
    const newResponses = {
      ...responses,
      [currentField.nomenclatura]: value
    };
    setResponses(newResponses);
    
    // Auto-clear input for next field
    if (currentField.fieldType === 'numero' || currentField.fieldType === 'calculo') {
      setTimeout(() => {
        const input = document.querySelector('input[type="number"]') as HTMLInputElement;
        if (input) input.value = '';
      }, 300);
    }
    
    moveToNextField();
  };

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const currentValues = responses[currentField.nomenclatura] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((v: string) => v !== option);
    }
    
    setResponses(prev => ({
      ...prev,
      [currentField.nomenclatura]: newValues
    }));
  };

  const moveToNextField = () => {
    setTimeout(() => {
      if (currentFieldIndex < allFields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
      } else {
        // Calcular resultado se for calculadora
        if (step.nodeType === 'calculator' && step.formula) {
          console.log('🧮 Iniciando cálculo da calculadora');
          const calculationFields = allFields.filter(f => f.fieldType === 'calculo');
          const calculationResponses: Record<string, number> = {};
          
          calculationFields.forEach(field => {
            const value = responses[field.nomenclatura];
            calculationResponses[field.nomenclatura] = typeof value === 'number' ? value : parseFloat(value) || 0;
          });
          
          console.log('📊 Dados para cálculo:', { 
            formula: step.formula, 
            calculationResponses, 
            allResponses: responses 
          });
          
          const result = calculateFormula(step.formula, calculationResponses);
          setCalculatedResult(result);
          
          console.log('🎯 Resultado final da calculadora:', result);
        }
        setShowResult(true);
      }
    }, 300);
  };

  const calculateFormula = (formula: string, values: Record<string, number>): number => {
    try {
      console.log('🧮 Calculando fórmula:', { formula, values });
      let processedFormula = formula;
      
      // Substituir variáveis por valores - ordenar por tamanho decrescente para evitar conflitos
      const sortedEntries = Object.entries(values).sort(([a], [b]) => b.length - a.length);
      
      sortedEntries.forEach(([key, value]) => {
        // Usar regex mais específica que considera limites de palavra
        const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
        console.log(`  Substituindo ${key} por ${value}: ${processedFormula}`);
      });

      // Tratar operações matemáticas comuns
      processedFormula = processedFormula.replace(/²/g, '**2');
      processedFormula = processedFormula.replace(/\^/g, '**');
      
      console.log('📊 Fórmula processada:', processedFormula);
      
      // Avaliar a fórmula
      const result = new Function('return ' + processedFormula)();
      const finalResult = typeof result === 'number' && !isNaN(result) ? result : 0;
      
      console.log('✅ Resultado calculado:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('❌ Erro no cálculo da fórmula:', error);
      return 0;
    }
  };

  const handleComplete = () => {
    // Clear any pending timer
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
    }

    console.log('🔄 UnifiedPatientRenderer: handleComplete chamado para nodeType:', step.nodeType);

    // Organizar respostas por tipo
    const calculationResponses: Record<string, number> = {};
    const questionResponses: Record<string, any> = {};
    const fieldResponses: Record<string, { value: any, fieldType: string }> = {};
    
    Object.entries(responses).forEach(([nomenclatura, value]) => {
      const field = allFields.find(f => f.nomenclatura === nomenclatura);
      const fieldType = field?.fieldType || 'pergunta';
      
      fieldResponses[nomenclatura] = { value, fieldType };
      
      if (fieldType === 'calculo' || fieldType === 'numero') {
        calculationResponses[nomenclatura] = value;
      } else {
        questionResponses[nomenclatura] = value;
      }
    });

    const responseData = {
      nodeId: step.nodeId,
      nodeType: step.nodeType,
      calculationResponses,
      questionResponses,
      fieldResponses,
      result: calculatedResult,
      calculatorResults: calculationResponses,
      questionResults: questionResponses,
      answer: step.nodeType === 'question' ? responses.resposta : undefined,
      value: step.nodeType === 'number' ? responses[step.nomenclatura] : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('✅ UnifiedPatientRenderer: Enviando responseData:', responseData);
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
              {step.nodeType === 'calculator' ? 'Avaliação Concluída' : 'Resposta Registrada'}
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
              {step.nodeType === 'calculator' 
                ? 'Seus dados foram registrados com sucesso. Agradecemos por responder o questionário médico.'
                : 'Sua resposta foi registrada com sucesso. Obrigado!'
              }
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

  // FormStart com mensagem de boas-vindas acolhedora
  if (step.nodeType === 'formStart') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Bem-vindo ao seu novo formulário! 🎉
            </h3>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {step.title || 'Questionário Médico'}
            </p>
            
            {step.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {step.description}
              </p>
            )}

            <div className="bg-green-500/10 dark:bg-green-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Formulário Disponível
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Iniciando automaticamente em alguns segundos...
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Pronto para começar</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FormEnd com status do WhatsApp
  if (step.nodeType === 'formEnd') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {step.title || 'Formulário Concluído! ✅'}
            </h3>
            
            {step.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {step.description}
              </p>
            )}

            {/* Status do WhatsApp para arquivos */}
            {step.arquivos && Array.isArray(step.arquivos) && step.arquivos.length > 0 && (
              <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6 border border-emerald-500/20">
                <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center justify-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Materiais
                </h4>
                
                {whatsappStatus === 'sending' && (
                  <div className="flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm">Enviando materiais por WhatsApp...</span>
                  </div>
                )}
                {whatsappStatus === 'sent' && (
                  <div className="flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                    <Send className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">✅ Materiais enviados por WhatsApp!</span>
                  </div>
                )}
                {whatsappStatus === 'error' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ Erro ao enviar materiais
                  </p>
                )}
                {whatsappStatus === 'idle' && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    📱 Preparando envio...
                  </p>
                )}
              </div>
            )}

            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6">
              <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                🎉 Parabéns! Você concluiu este formulário com sucesso.
              </p>
            </div>

            {whatsappStatus === 'sent' && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Finalizando automaticamente em alguns segundos...
              </div>
            )}

            <Button
              onClick={handleComplete}
              disabled={isLoading || whatsappStatus === 'sending'}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
              size="lg"
            >
              {isLoading ? 'Processando...' : whatsappStatus === 'sent' ? 'Finalizar' : 'Aguarde...'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Delay Timer - aguarda o tempo definido e continua automaticamente
  if (step.nodeType === 'delay') {
    const executionId = window.location.pathname.split('/').pop();
    const availableAt = step.next_step_available_at || step.availableAt;
    
    if (!availableAt) {
      console.error('❌ DelayTimer: next_step_available_at não encontrado');
      return (
        <div className="text-center p-8">
          <p className="text-red-500">Erro: Data de disponibilidade não encontrada</p>
        </div>
      );
    }

    if (!executionId) {
      console.error('❌ DelayTimer: executionId não encontrado');
      return (
        <div className="text-center p-8">
          <p className="text-red-500">Erro: ID de execução não encontrado</p>
        </div>
      );
    }

    return (
      <ImprovedFlowDelayTimer 
        step={{ ...step, availableAt }}
        executionId={executionId}
        onComplete={() => {
          console.log('⏰ DelayTimer expirado, recarregando para próximo step...');
          window.location.reload();
        }}
      />
    );
  }

  // Finalização do Fluxo - última tela para o paciente (DEFINITIVA)
  if (step.nodeType === 'flowEnd' || step.nodeType === 'end') {
    return (
      <FlowEndNode 
        step={step}
        onComplete={handleComplete}
        isLoading={isLoading}
      />
    );
  }

  if (!currentField) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum campo encontrado para este tipo de etapa.
            </p>
            <Button
              onClick={handleComplete}
              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 font-medium"
              size="lg"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Questionário Médico
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pergunta {currentFieldIndex + 1} de {allFields.length}
            </p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentFieldIndex + 1) / allFields.length) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentField.pergunta}
              </Label>
            </div>
            
            <div className="space-y-4">
              {/* Campo numérico ou de cálculo */}
              {(currentField.fieldType === 'calculo' || currentField.fieldType === 'numero') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {currentField.prefixo && (
                      <span className="text-gray-600 font-medium">{currentField.prefixo}</span>
                    )}
                    <Input
                      type="number"
                      step={currentField.tipo === 'decimal' ? '0.01' : '1'}
                      placeholder="Digite sua resposta..."
                      className="text-xl text-center border-2 border-gray-200 focus:border-blue-500 rounded-xl py-4"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            const numericValue = parseFloat(target.value) || 0;
                            handleResponse(numericValue);
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
                        const numericValue = parseFloat(input.value) || 0;
                        handleResponse(numericValue);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    size="lg"
                  >
                    Próxima Pergunta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Escolha única */}
              {currentField.questionType === 'escolha-unica' && (
                <div className="space-y-3">
                  {currentField.opcoes.map((opcao: string, index: number) => (
                    <Button
                      key={opcao}
                      variant="outline"
                      onClick={() => handleResponse(opcao)}
                      className="w-full p-4 text-left justify-start border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all duration-200"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3" />
                      {opcao}
                    </Button>
                  ))}
                </div>
              )}

              {/* Múltipla escolha */}
              {currentField.questionType === 'multipla-escolha' && (
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
                      const currentValues = responses[currentField.nomenclatura] || [];
                      handleResponse(currentValues);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    size="lg"
                    disabled={!responses[currentField.nomenclatura]?.length}
                  >
                    Próxima Pergunta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Texto livre */}
              {currentField.questionType === 'texto-livre' && (
                <div className="space-y-4">
                  <Textarea
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    autoFocus
                  />
                  
                  <Button
                    onClick={() => handleResponse(textResponse)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    size="lg"
                    disabled={!textResponse.trim()}
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
