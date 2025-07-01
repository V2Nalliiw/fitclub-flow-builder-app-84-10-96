
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DelayTimerProps {
  availableAt: string;
  onDelayExpired?: () => void;
}

export const DelayTimer: React.FC<DelayTimerProps> = ({ availableAt, onDelayExpired }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const targetDate = new Date(availableAt);
      
      if (now >= targetDate) {
        if (!expired) {
          setExpired(true);
          onDelayExpired?.();
        }
        setTimeLeft('Disponível agora!');
        return;
      }

      const distance = formatDistanceToNow(targetDate, {
        addSuffix: true,
        locale: ptBR
      });
      
      setTimeLeft(distance);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [availableAt, expired, onDelayExpired]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {expired ? 'Próxima etapa liberada!' : 'Aguardando próxima etapa'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {expired 
                ? 'Você pode continuar com o próximo formulário'
                : `Próxima etapa será liberada ${timeLeft}`
              }
            </p>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Data programada: {formatDate(availableAt)}</span>
            </div>
          </div>
        </div>

        {expired && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              ✅ Tempo de espera concluído. Você pode prosseguir!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
