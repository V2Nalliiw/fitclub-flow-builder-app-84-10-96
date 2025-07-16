import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlowDelayTimerProps {
  availableAt: string;
  executionId: string;
  onDelayExpired?: () => void;
}

export const FlowDelayTimer: React.FC<FlowDelayTimerProps> = ({ 
  availableAt, 
  executionId,
  onDelayExpired 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);
  const { toast } = useToast();

  // Função para encontrar próximo nó no fluxo
  const findNextNode = async (executionId: string) => {
    try {
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('flow_id, current_node')
        .eq('id', executionId)
        .single();

      if (!execution) {
        console.error('❌ Execução não encontrada');
        return null;
      }

      const { data: flow } = await supabase
        .from('flows')
        .select('nodes, edges')
        .eq('id', execution.flow_id)
        .single();

      if (!flow) {
        console.error('❌ Fluxo não encontrado');
        return null;
      }

      const edges = Array.isArray(flow.edges) ? (flow.edges as any[]) : [];
      const currentNodeId = execution.current_node;
      
      const outgoingEdge = edges.find((edge: any) => edge.source === currentNodeId);
      if (!outgoingEdge) {
        console.log('🔚 Não há próximo nó - fim do fluxo');
        return null;
      }

      const nextNodeId = outgoingEdge.target;
      const nodes = Array.isArray(flow.nodes) ? (flow.nodes as any[]) : [];
      const nextNode = nodes.find((node: any) => node.id === nextNodeId);

      return nextNode;
    } catch (error) {
      console.error('❌ Erro ao encontrar próximo nó:', error);
      return null;
    }
  };

  // Função para progredir fluxo automaticamente
  const autoProgressFlow = async () => {
    if (!executionId) {
      console.error('❌ ExecutionId não fornecido');
      return;
    }

    setIsProgressing(true);
    console.log('🚀 FlowDelayTimer: Auto-progressão iniciando...');

    try {
      const nextNode = await findNextNode(executionId);
      
      if (!nextNode) {
        console.log('🔚 Fluxo finalizado - não há próximo nó');
        return;
      }

      console.log('📍 Próximo nó encontrado:', nextNode.type, nextNode.id);

      // Atualizar execução para próximo nó
      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          current_node: nextNode.id,
          current_step: {
            nodeId: nextNode.id,
            nodeType: nextNode.type,
            title: nextNode.data?.titulo || nextNode.data?.title || 'Próximo Step',
            status: 'available'
          },
          next_step_available_at: null, // Remover delay
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (updateError) {
        console.error('❌ Erro ao atualizar execução:', updateError);
        return;
      }

      console.log('✅ Execução atualizada para próximo nó:', nextNode.id);

      // Se for FormStart, enviar WhatsApp automaticamente
      if (nextNode.type === 'formStart') {
        console.log('📱 Enviando WhatsApp para próximo FormStart...');
        
        const { data: execution } = await supabase
          .from('flow_executions')
          .select('patient_id, flow_name')
          .eq('id', executionId)
          .single();

        if (execution) {
          const { error: whatsappError } = await supabase.functions.invoke('send-form-notification', {
            body: {
              patientId: execution.patient_id,
              formName: nextNode.data?.titulo || execution.flow_name || 'Formulário',
              executionId: executionId
            }
          });

          if (whatsappError) {
            console.error('❌ Erro ao enviar WhatsApp:', whatsappError);
          } else {
            console.log('✅ WhatsApp enviado com sucesso');
          }
        }
      }

      // Redirecionar para continuar o fluxo
      if (onDelayExpired) {
        console.log('🔄 Chamando callback onDelayExpired...');
        onDelayExpired();
      } else {
        console.log('🔄 Redirecionando para continuar fluxo...');
        setTimeout(() => {
          window.location.reload(); // Recarregar para mostrar próximo step
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Erro na auto-progressão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível continuar o fluxo automaticamente",
        variant: "destructive",
      });
    } finally {
      setIsProgressing(false);
    }
  };

  // Timer para atualizar contagem regressiva
  useEffect(() => {
    const targetDate = new Date(availableAt);
    
    const updateTimer = () => {
      const now = new Date();
      
      if (isAfter(now, targetDate)) {
        if (!isExpired && !isProgressing) {
          setIsExpired(true);
          setTimeRemaining('Tempo concluído!');
          console.log('⏰ FlowDelayTimer: Delay expirado, iniciando auto-progressão...');
          
          // Auto-progressão após 2 segundos
          setTimeout(() => {
            autoProgressFlow();
          }, 2000);
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
  }, [availableAt, isExpired, isProgressing, executionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            {isProgressing ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : isExpired ? (
              <CheckCircle2 className="h-10 w-10 text-white" />
            ) : (
              <Clock className="h-10 w-10 text-white" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {isProgressing ? 'Continuando Fluxo...' : isExpired ? 'Pronto para Continuar!' : 'Aguarde um Momento ⏰'}
          </h3>
          
          {!isExpired && !isProgressing && (
            <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-4">
              {timeRemaining}
            </div>
          )}
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {isProgressing 
              ? 'Processando próxima etapa automaticamente...' 
              : isExpired 
                ? 'Tempo de espera concluído! Progredindo...'
                : 'O fluxo continuará automaticamente após este período.'
            }
          </p>

          <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-4 border border-blue-500/20 mb-6">
            {isExpired && isProgressing ? (
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                  🔄 Progredindo para próxima etapa...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aguarde enquanto preparamos o próximo passo.
                </p>
              </div>
            ) : isExpired ? (
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                  ✅ Período de espera concluído!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Continuando automaticamente...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                  📋 Processamento em andamento
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Este tempo de espera faz parte do seu tratamento.
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => window.location.href = '/'}
            disabled={isProgressing}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isProgressing ? 'Processando...' : 'Voltar ao Início'}
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            {isProgressing 
              ? 'Aguarde o processamento automático...' 
              : 'Este fluxo continuará automaticamente.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};