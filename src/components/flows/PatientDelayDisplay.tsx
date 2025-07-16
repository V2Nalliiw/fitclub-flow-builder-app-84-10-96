import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { isAfter } from 'date-fns';

interface PatientDelayDisplayProps {
  availableAt: string;
  onDelayExpired?: () => void;
}

export const PatientDelayDisplay: React.FC<PatientDelayDisplayProps> = ({ 
  availableAt, 
  onDelayExpired 
}) => {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(availableAt);
    
    const checkExpiration = () => {
      const now = new Date();
      
      if (isAfter(now, targetDate) && !isExpired) {
        setIsExpired(true);
        console.log('⏰ PatientDelayDisplay: Delay expirado, executando callback...');
        if (onDelayExpired) {
          onDelayExpired();
        }
      }
    };

    // Verificar imediatamente
    checkExpiration();
    
    // Verificar a cada 30 segundos (mais eficiente que a cada segundo)
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [availableAt, onDelayExpired, isExpired]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Formulário Concluído! ✅
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Parabéns! Você completou esta etapa com sucesso.
          </p>

          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/20 mb-6">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-2">
              📅 Próximo formulário em breve
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Você receberá uma notificação no WhatsApp quando o próximo formulário estiver disponível.
            </p>
          </div>
          
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
            size="lg"
          >
            Voltar ao Início
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Pode fechar esta página com segurança.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};