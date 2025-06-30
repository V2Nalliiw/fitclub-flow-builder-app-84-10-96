
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        setIsExpired(true);
        setTimeRemaining('Disponível agora!');
        if (onDelayExpired) {
          onDelayExpired();
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
  }, [availableAt, onDelayExpired]);

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
            {isExpired ? (
              <Timer className="h-6 w-6 text-white" />
            ) : (
              <Clock className="h-6 w-6 text-white animate-pulse" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isExpired ? 'Próximo formulário disponível!' : 'Aguardando próximo formulário'}
              </h3>
              <Badge variant={isExpired ? 'default' : 'secondary'} className={
                isExpired 
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200'
              }>
                {isExpired ? 'Disponível' : 'Aguardando'}
              </Badge>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {isExpired 
                ? 'Você pode continuar com o próximo formulário agora!'
                : 'O próximo formulário será liberado automaticamente quando o tempo chegar.'
              }
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(availableAt), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
              
              {!isExpired && (
                <div className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                  <Timer className="h-4 w-4" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
