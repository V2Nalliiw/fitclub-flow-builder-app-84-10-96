import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy } from 'lucide-react';

interface FlowEndNodeProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const FlowEndNode: React.FC<FlowEndNodeProps> = ({
  step,
  onComplete,
  isLoading = false
}) => {
  const handleComplete = () => {
    onComplete({
      nodeId: step.nodeId,
      nodeType: 'flowEnd',
      finalizado: true,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎉 Tratamento Concluído!
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Parabéns! Você completou com sucesso todo o tratamento prescrito.
          </p>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <p className="text-purple-700 dark:text-purple-300 font-medium mb-2">
              ✨ Fluxo Finalizado Definitivamente
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seu tratamento foi concluído. Obrigado por seguir todas as etapas com dedicação!
            </p>
          </div>
          
          {step.mensagemFinal && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {step.mensagemFinal}
              </p>
            </div>
          )}
          
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-medium"
            size="lg"
          >
            {isLoading ? 'Finalizando...' : 'Finalizar Tratamento'}
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Este foi o último formulário do seu tratamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};