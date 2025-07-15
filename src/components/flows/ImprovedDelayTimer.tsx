
import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImprovedDelayTimerProps {
  availableAt: string;
  onDelayExpired?: () => void;
}

export const ImprovedDelayTimer: React.FC<ImprovedDelayTimerProps> = ({ 
  availableAt, 
  onDelayExpired 
}) => {
  useEffect(() => {
    // Auto-redirect após 3 segundos para não dar chance do usuário pular
    const timer = setTimeout(() => {
      console.log('🏠 DelayTimer: Redirecionando automaticamente para página inicial...');
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirectToHome = () => {
    console.log('🏠 DelayTimer: Redirecionando para página inicial...');
    window.location.href = '/';
  };

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
