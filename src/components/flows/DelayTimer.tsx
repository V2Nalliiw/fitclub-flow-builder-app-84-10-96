
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

  const handleRedirectToHome = () => {
    console.log('🏠 DelayTimer: Redirecionando para página inicial...');
    window.location.href = '/';
  };

  // Auto-redirect quando delay expira
  useEffect(() => {
    if (isExpired && onDelayExpired) {
      console.log('⏰ DelayTimer: Delay expirado, executando callback...');
      onDelayExpired();
    }
  }, [isExpired, onDelayExpired]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Formulário Concluído! ✅
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Parabéns! Você completou esta etapa com sucesso. 
          </p>

          <div className="space-y-4">
            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/20">
              <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-2">
                📅 Próximo formulário em breve
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você receberá uma notificação no WhatsApp quando o próximo formulário estiver disponível.
              </p>
            </div>
            
            <Button
              onClick={handleRedirectToHome}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
              size="lg"
            >
              Voltar ao Início
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Pode fechar esta página com segurança. Entre em contato com a clínica se tiver dúvidas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
