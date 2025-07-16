import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImprovedFlowDelayTimerProps {
  step: any;
  executionId: string;
  onComplete: () => void;
}

export const ImprovedFlowDelayTimer: React.FC<ImprovedFlowDelayTimerProps> = ({
  step,
  executionId,
  onComplete
}) => {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasProgressedRef = useRef(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!step.availableAt) {
        console.log('❌ DelayTimer: Sem availableAt definido');
        setIsExpired(true);
        return;
      }

      const now = new Date().getTime();
      const targetTime = new Date(step.availableAt).getTime();
      const diff = targetTime - now;

      console.log('⏰ DelayTimer: Calculando tempo restante:', {
        now: new Date(now).toISOString(),
        target: new Date(targetTime).toISOString(),
        diff: diff,
        diffMinutes: Math.round(diff / (1000 * 60))
      });

      if (diff <= 0) {
        console.log('✅ DelayTimer: Tempo expirado, liberando próximo step');
        setTimeRemaining(0);
        setIsExpired(true);
        
        // Parar o interval aqui para evitar múltiplas chamadas
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Executar apenas uma vez
        if (!hasProgressedRef.current) {
          hasProgressedRef.current = true;
          handleTimeExpired();
        }
      } else {
        setTimeRemaining(Math.ceil(diff / 1000));
        setIsExpired(false);
      }
    };

    // Calcular imediatamente
    calculateTimeRemaining();

    // Verificar a cada segundo apenas se não expirou
    if (!isExpired && !hasProgressedRef.current) {
      intervalRef.current = setInterval(calculateTimeRemaining, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [step.availableAt, isExpired]);

  const handleTimeExpired = async () => {
    if (isProgressing || hasProgressedRef.current) return;
    
    console.log('🚀 DelayTimer: Tempo expirado, progredindo automaticamente');
    setIsProgressing(true);

    try {
      // Buscar dados atuais da execução
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        console.error('❌ DelayTimer: Erro ao buscar execução:', execError);
        toast({
          title: "Erro",
          description: "Não foi possível continuar o fluxo automaticamente",
          variant: "destructive",
        });
        return;
      }

      const currentStepData = execution.current_step as {
        steps?: any[];
        currentStepIndex?: number;
        calculatorResults?: Record<string, number>;
        userResponses?: Record<string, any>;
      } | null;

      const currentSteps = currentStepData?.steps || [];
      const currentIndex = currentStepData?.currentStepIndex || 0;

      // Encontrar próximo step válido (pular o delay atual)
      let nextStepIndex = currentIndex + 1;
      let nextStep = null;

      // Buscar próximo step disponível
      for (let i = nextStepIndex; i < currentSteps.length; i++) {
        const candidateStep = currentSteps[i];
        if (!candidateStep.completed) {
          nextStep = candidateStep;
          nextStepIndex = i;
          break;
        }
      }

      if (!nextStep) {
        console.log('✅ DelayTimer: Nenhum próximo step encontrado, fluxo concluído');
        
        const { error: updateError } = await supabase
          .from('flow_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            current_node: null,
            next_step_available_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', executionId);

        if (updateError) {
          console.error('❌ DelayTimer: Erro ao finalizar execução:', updateError);
        }

        toast({
          title: "Fluxo Concluído! 🎉",
          description: "Você completou todas as etapas com sucesso!",
        });

        // Redirecionar para página inicial após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      console.log('🔄 DelayTimer: Progredindo para próximo step:', nextStep);

      // Atualizar execução para próximo step
      const updateData = {
        status: 'in-progress',
        current_node: nextStep.nodeId,
        current_step: {
          ...currentStepData,
          currentStepIndex: nextStepIndex
        } as any,
        next_step_available_at: null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (updateError) {
        console.error('❌ DelayTimer: Erro ao atualizar execução:', updateError);
        toast({
          title: "Erro",
          description: "Não foi possível continuar automaticamente",
          variant: "destructive",
        });
        return;
      }

      // Enviar WhatsApp APENAS se próximo step for FormStart
      if (nextStep.nodeType === 'formStart') {
        console.log('📱 DelayTimer: Enviando notificação WhatsApp para FormStart');
        
        try {
          const { data: executionData } = await supabase
            .from('flow_executions')
            .select('patient_id, flow_name')
            .eq('id', executionId)
            .single();

          if (executionData) {
            const { error: whatsappError } = await supabase.functions.invoke('send-form-notification', {
              body: {
                patientId: executionData.patient_id,
                formName: nextStep.title || executionData.flow_name || 'Formulário',
                executionId: executionId
              }
            });

            if (whatsappError) {
              console.error('❌ DelayTimer: Erro ao enviar WhatsApp:', whatsappError);
            } else {
              console.log('✅ DelayTimer: WhatsApp enviado com sucesso para FormStart');
            }
          }
        } catch (error) {
          console.error('❌ DelayTimer: Erro crítico ao enviar WhatsApp:', error);
        }
      } else {
        console.log('🔕 DelayTimer: Próximo step não é FormStart, não enviando WhatsApp');
      }

      toast({
        title: "Tempo Concluído! ⏰",
        description: "Redirecionando para página inicial...",
      });

      // Redirecionar para página inicial onde o próximo step estará disponível
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      console.error('❌ DelayTimer: Erro crítico na progressão automática:', error);
      toast({
        title: "Erro",
        description: "Falha na progressão automática do fluxo",
        variant: "destructive",
      });
    } finally {
      setIsProgressing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          {isExpired ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Tempo Concluído! ✅
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                O tempo de espera foi concluído. Progredindo para próxima etapa...
              </p>

              <Button
                onClick={onComplete}
                disabled={isProgressing}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 font-medium"
                size="lg"
              >
                {isProgressing ? 'Carregando...' : 'Continuar'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {step.title || 'Aguardando Intervalo'}
              </h3>
              
              {step.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {step.description}
                </p>
              )}

              <div className="bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl p-6 mb-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Tempo restante para próxima etapa
                </p>
              </div>

              <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-4">
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  ⏰ A próxima etapa será liberada automaticamente na página inicial
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};