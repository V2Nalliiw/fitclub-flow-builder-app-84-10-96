
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Timer, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DelayTimerProps {
  availableAt: string;
  onDelayExpired?: () => void;
}

export const DelayTimer: React.FC<DelayTimerProps> = ({ availableAt, onDelayExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(availableAt);
    
    const updateTimer = () => {
      const now = new Date();
      
      if (isAfter(now, targetDate)) {
        if (!isExpired) {
          setIsExpired(true);
          setTimeRemaining('Disponível agora!');
          if (onDelayExpired) {
            onDelayExpired();
          }
        }
        return;
      }

      const distance = targetDate.getTime() - now.getTime();
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [availableAt, onDelayExpired, isExpired]);

  const handleRefresh = () => {
    if (onDelayExpired) {
      onDelayExpired();
    }
  };

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:bg-none dark:bg-[#0E0E0E]/90 border-gray-200 dark:border-[#1A1A1A]">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full flex items-center justify-center mx-auto mb-6">
          {isExpired ? (
            <CheckCircle className="h-10 w-10 text-white" />
          ) : (
            <CheckCircle className="h-10 w-10 text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {isExpired ? 'Novo formulário disponível!' : 'Formulário completado! ✅'}
        </h3>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {isExpired 
            ? 'Você pode continuar com o próximo formulário agora!'
            : 'Parabéns! Você completou esta etapa com sucesso. Em breve receberá um novo formulário.'
          }
        </p>

        {isExpired ? (
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#5D8701] text-white px-8 py-3"
            size="lg"
          >
            Continuar Formulário
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#5D8701]/10 dark:bg-[#5D8701]/20 rounded-lg p-4 border border-[#5D8701]/20">
              <p className="text-[#5D8701] font-medium mb-2">
                📅 Próximo formulário em breve
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você receberá uma notificação quando o próximo formulário estiver disponível.
              </p>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Pode fechar esta página com segurança. Entre em contato com a clínica se tiver dúvidas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
