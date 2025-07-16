import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientDelayDisplayProps {
  availableAt: string;
  onDelayExpired?: () => void;
  executionId?: string;
}

export const PatientDelayDisplay: React.FC<PatientDelayDisplayProps> = ({ 
  availableAt, 
  onDelayExpired,
  executionId 
}) => {
  const [isExpired, setIsExpired] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);
  const { toast } = useToast();

  const findNextFormStartNode = async (executionId: string) => {
    try {
      // Buscar dados da execução
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('flow_id, current_node')
        .eq('id', executionId)
        .single();

      if (!execution) {
        console.error('❌ Execução não encontrada');
        return null;
      }

      // Buscar o fluxo para encontrar próximo nó
      const { data: flow } = await supabase
        .from('flows')
        .select('nodes, edges')
        .eq('id', execution.flow_id)
        .single();

      if (!flow) {
        console.error('❌ Fluxo não encontrado');
        return null;
      }

      // Encontrar próximo FormStart nas edges - com type casting
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

      if (nextNode && nextNode.type === 'formStart') {
        return nextNode;
      }

      console.log('⚠️ Próximo nó não é FormStart:', nextNode?.type);
      return nextNode; // Retornar qualquer próximo nó
    } catch (error) {
      console.error('❌ Erro ao encontrar próximo nó:', error);
      return null;
    }
  };

  const autoProgressFlow = async () => {
    if (!executionId) {
      console.error('❌ ExecutionId não fornecido para auto-progressão');
      return;
    }

    setIsProgressing(true);
    console.log('🚀 Auto-progressão: Iniciando...');

    try {
      // Encontrar próximo nó
      const nextNode = await findNextFormStartNode(executionId);
      
      if (!nextNode) {
        console.log('🔚 Não há próximo nó - fluxo finalizado');
        return;
      }

      // Atualizar execução no banco para próximo nó (com type casting)
      const nextNodeCasted = nextNode as any;
      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          current_node: nextNodeCasted.id,
          current_step: {
            nodeId: nextNodeCasted.id,
            nodeType: nextNodeCasted.type,
            title: nextNodeCasted.data?.titulo || 'Formulário',
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

      console.log('✅ Execução atualizada para próximo nó:', nextNodeCasted.id);

      // Se for FormStart, enviar WhatsApp automaticamente
      if (nextNodeCasted.type === 'formStart') {
        console.log('📱 Enviando WhatsApp para próximo FormStart...');
        
        // Buscar dados do paciente
        const { data: execution } = await supabase
          .from('flow_executions')
          .select('patient_id, flow_name')
          .eq('id', executionId)
          .single();

        if (execution) {
          // Enviar notificação via edge function
          const { error: whatsappError } = await supabase.functions.invoke('send-form-notification', {
            body: {
              patientId: execution.patient_id,
              formName: nextNodeCasted.data?.titulo || execution.flow_name || 'Formulário',
              executionId: executionId
            }
          });

          if (whatsappError) {
            console.error('❌ Erro ao enviar WhatsApp:', whatsappError);
          } else {
            console.log('✅ WhatsApp enviado para próximo FormStart');
          }
        }
      }

      // CRUCIAL: Redirecionar para o próximo formulário na URL
      console.log('🔄 Redirecionando para próximo formulário...');
      const newUrl = `/flow-execution/${executionId}`;
      window.location.href = newUrl;

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

  useEffect(() => {
    const targetDate = new Date(availableAt);
    
    const checkExpiration = () => {
      const now = new Date();
      
      if (isAfter(now, targetDate) && !isExpired && !isProgressing) {
        setIsExpired(true);
        console.log('⏰ PatientDelayDisplay: Delay expirado, iniciando auto-progressão...');
        
        // Auto-progressão automática após delay expirar
        setTimeout(() => {
          autoProgressFlow();
        }, 1000);
      }
    };

    // Verificar imediatamente
    checkExpiration();
    
    // Verificar a cada 30 segundos (mais eficiente que a cada segundo)
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [availableAt, isExpired, isProgressing, executionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            {isProgressing ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-white" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {isProgressing ? 'Preparando Próximo Formulário...' : 'Formulário Concluído! ✅'}
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {isProgressing 
              ? 'Processando automaticamente...' 
              : 'Parabéns! Você completou esta etapa com sucesso.'
            }
          </p>

          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/20 mb-6">
            {isExpired && isProgressing ? (
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                  🔄 Carregando próximo formulário...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aguarde enquanto preparamos seu próximo questionário.
                </p>
              </div>
            ) : isExpired ? (
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                  ⏰ Tempo concluído! Progredindo...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Redirecionando para próximo formulário.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-2">
                  📅 Próximo formulário em breve
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  O sistema continuará automaticamente quando for a hora.
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => window.location.href = '/'}
            disabled={isProgressing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
            size="lg"
          >
            {isProgressing ? 'Processando...' : 'Voltar ao Início'}
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            {isProgressing 
              ? 'Aguarde o processamento automático...' 
              : 'Pode fechar esta página com segurança.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};