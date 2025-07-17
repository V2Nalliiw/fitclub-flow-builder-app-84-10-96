
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar no backend se o delay expirou (polling)
  const checkDelayStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('flow_executions')
        .select('status, next_step_available_at, current_step')
        .eq('id', executionId)
        .single();

      if (error) {
        console.error('❌ Erro ao verificar status do delay:', error);
        return;
      }

      console.log('🔍 DelayTimer: Status atual da execução:', data);

      // Se o delay foi processado (next_step_available_at foi limpo)
      if (data.status === 'in-progress' && 
          (!data.next_step_available_at || new Date(data.next_step_available_at) <= new Date())) {
        console.log('✅ DelayTimer: Delay processado pelo backend, redirecionando...');
        setIsExpired(true);
        handleTimeExpired();
      }
    } catch (error) {
      console.error('❌ Erro no polling do delay:', error);
    }
  };

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
        console.log('✅ DelayTimer: Tempo expirado no frontend');
        setTimeRemaining(0);
        setIsExpired(true);
        
        // Parar intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setTimeRemaining(Math.ceil(diff / 1000));
        setIsExpired(false);
      }
    };

    // Calcular imediatamente
    calculateTimeRemaining();

    // Verificar a cada segundo apenas se não expirou
    if (!isExpired) {
      intervalRef.current = setInterval(calculateTimeRemaining, 1000);
    }

    // Polling para verificar se backend processou o delay (mais frequente)
    pollingRef.current = setInterval(checkDelayStatus, 3000); // A cada 3 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step.availableAt, isExpired, executionId]);

  const handleTimeExpired = async () => {
    console.log('⏰ DelayTimer: Tempo expirado, forçando processamento do delay...');

    try {
      // Forçar processamento da delay task
      const { data, error } = await supabase.functions.invoke('process-delay-tasks', {
        body: { forcedExecution: true }
      });

      if (error) {
        console.error('❌ Erro ao forçar processamento:', error);
      } else {
        console.log('✅ Processamento forçado executado:', data);
      }
    } catch (error) {
      console.error('❌ Erro na chamada forçada:', error);
    }

    toast({
      title: "Tempo Concluído! ⏰",
      description: "Redirecionando para página inicial...",
    });

    // 🎯 CORREÇÃO: Redirecionar sempre para o dashboard do paciente
    setTimeout(() => {
      console.log('🔄 DelayTimer: Redirecionando para dashboard do paciente');
      window.location.href = '/';
    }, 3000);
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
                Redirecionando automaticamente para o dashboard...
              </p>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
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
                  ⏰ A próxima etapa será liberada automaticamente no dashboard
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
