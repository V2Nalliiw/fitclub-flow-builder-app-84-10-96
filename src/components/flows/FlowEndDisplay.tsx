import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlowEndDisplayProps {
  executionId: string;
  execution: any;
}

export const FlowEndDisplay: React.FC<FlowEndDisplayProps> = ({ 
  executionId, 
  execution 
}) => {
  const { toast } = useToast();

  useEffect(() => {
    const finalizeExecution = async () => {
      try {
        console.log('🔚 FlowEndDisplay: Finalizando execução e atribuição...');
        
        // Atualizar execução como completada
        const { error: executionError } = await supabase
          .from('flow_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            progress: 100
          })
          .eq('id', executionId);

        if (executionError) {
          console.error('❌ Erro ao finalizar execução:', executionError);
          return;
        }
        
        // Atualizar atribuição como completada
        const { data: assignment } = await supabase
          .from('flow_assignments')
          .select('id')
          .eq('patient_id', execution?.patient_id)
          .eq('flow_id', execution?.flow_id)
          .maybeSingle();
        
        if (assignment) {
          const { error: assignmentError } = await supabase
            .from('flow_assignments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', assignment.id);

          if (assignmentError) {
            console.error('❌ Erro ao finalizar atribuição:', assignmentError);
          }
        }
        
        console.log('✅ FlowEndDisplay: Tratamento finalizado com sucesso');
        
        toast({
          title: "Tratamento Finalizado!",
          description: "Seu processo foi concluído com sucesso.",
        });
        
      } catch (error) {
        console.error('❌ FlowEndDisplay: Erro ao finalizar:', error);
        toast({
          title: "Erro",
          description: "Houve um problema ao finalizar o tratamento.",
          variant: "destructive",
        });
      }
    };
    
    finalizeExecution();
  }, [executionId, execution, toast]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E] backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎉 Tratamento Concluído!
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Parabéns! Você completou todo o seu tratamento com sucesso.
          </p>
          
          <div className="bg-red-500/10 dark:bg-red-500/20 rounded-lg p-4 border border-red-500/20 mb-6">
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
              ✅ Fluxo Finalizado
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seu processo foi concluído. Entre em contato com a clínica para mais informações.
            </p>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-medium"
            size="lg"
          >
            Voltar ao Início
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Obrigado por usar nosso sistema!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};