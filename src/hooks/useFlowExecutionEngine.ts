
import { useState, useCallback } from 'react';
import { FlowNode } from '@/types/flow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  scheduledFor?: string;
}

export const useFlowExecutionEngine = () => {
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const [processing, setProcessing] = useState(false);

  const executeFlowStep = useCallback(async (
    executionId: string,
    step: ExecutionStep,
    nodeData: any
  ) => {
    console.log(`Executando etapa ${step.nodeType}:`, { executionId, step, nodeData });

    try {
      switch (step.nodeType) {
        case 'start':
          await processStartNode(executionId, step, nodeData);
          break;

        case 'formStart':
          await processFormStartNode(executionId, step, nodeData);
          break;

        case 'formEnd':
          await processFormEndNode(executionId, step, nodeData);
          break;

        case 'delay':
          await processDelayNode(executionId, step, nodeData);
          break;

        case 'question':
          await processQuestionNode(executionId, step, nodeData);
          break;

        case 'whatsapp':
          await processWhatsAppNode(executionId, step, nodeData);
          break;

        case 'end':
          await processEndNode(executionId, step, nodeData);
          break;

        default:
          throw new Error(`Tipo de nó não suportado: ${step.nodeType}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao executar etapa:', error);
      await handleStepError(executionId, step, error as Error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const processStartNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    await supabase
      .from('flow_executions')
      .update({
        status: 'em-andamento',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    console.log('Nó de início processado');
  };

  const processFormStartNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    const formUrl = `${window.location.origin}/forms/${step.nodeId}?execution=${executionId}`;
    
    await supabase.from('flow_steps').insert({
      execution_id: executionId,
      node_id: step.nodeId,
      node_type: step.nodeType,
      title: nodeData.titulo || 'Formulário',
      description: nodeData.descricao,
      status: 'disponivel',
      form_url: formUrl,
      available_at: new Date().toISOString(),
    });

    console.log('Formulário criado:', formUrl);
  };

  const processFormEndNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    // Verificar se há conteúdo para enviar
    if (nodeData.conteudo && nodeData.conteudo.length > 0) {
      // Processar envio de conteúdo via WhatsApp ou email
      console.log('Enviando conteúdo final:', nodeData.conteudo);
    }

    console.log('Fim de formulário processado');
  };

  const processDelayNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    const delay = nodeData.quantidade || 1;
    const tipo = nodeData.tipoIntervalo || 'dias';
    
    let nextExecutionDate = new Date();
    switch (tipo) {
      case 'minutos':
        nextExecutionDate.setMinutes(nextExecutionDate.getMinutes() + delay);
        break;
      case 'horas':
        nextExecutionDate.setHours(nextExecutionDate.getHours() + delay);
        break;
      case 'dias':
      default:
        nextExecutionDate.setDate(nextExecutionDate.getDate() + delay);
        break;
    }

    await supabase
      .from('flow_executions')
      .update({
        status: 'aguardando',
        scheduled_for: nextExecutionDate.toISOString(),
        next_step_available_at: nextExecutionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    console.log('Delay programado para:', nextExecutionDate);
  };

  const processQuestionNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    await supabase.from('flow_steps').insert({
      execution_id: executionId,
      node_id: step.nodeId,
      node_type: step.nodeType,
      title: nodeData.pergunta || 'Pergunta',
      description: 'Responda a pergunta para continuar',
      status: 'disponivel',
      available_at: new Date().toISOString(),
    });

    console.log('Pergunta criada');
  };

  const processWhatsAppNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    // Buscar dados da execução para obter informações do paciente
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('patient_id')
      .eq('id', executionId)
      .single();

    if (!execution) {
      throw new Error('Execução não encontrada');
    }

    // Buscar dados do paciente
    const { data: patient } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('user_id', execution.patient_id)
      .single();

    // Registrar mensagem para ser enviada
    await supabase.from('whatsapp_messages').insert({
      execution_id: executionId,
      patient_id: execution.patient_id,
      to_phone: nodeData.telefone || '',
      message_text: nodeData.mensagem || '',
      status: 'pending',
    });

    console.log('Mensagem WhatsApp programada');
  };

  const processEndNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    await supabase
      .from('flow_executions')
      .update({
        status: 'concluido',
        progress: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    // Criar notificação de conclusão
    createNotification({
      type: 'success',
      category: 'flow',
      title: 'Fluxo Concluído',
      message: 'O fluxo foi executado com sucesso até o final.',
      actionable: false,
    });

    console.log('Fluxo finalizado com sucesso');
  };

  const handleStepError = async (executionId: string, step: ExecutionStep, error: Error) => {
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('retry_count')
      .eq('id', executionId)
      .single();

    const currentRetryCount = execution?.retry_count || 0;
    const maxRetries = 3;

    if (currentRetryCount < maxRetries) {
      // Incrementar contador de tentativas e reagendar
      await supabase
        .from('flow_executions')
        .update({
          retry_count: currentRetryCount + 1,
          error_message: error.message,
          scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Reagendar em 30 min
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      console.log(`Erro na execução, tentativa ${currentRetryCount + 1}/${maxRetries}`);
    } else {
      // Marcar como falhou após esgotar tentativas
      await supabase
        .from('flow_executions')
        .update({
          status: 'falhou',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      // Criar notificação de erro
      createNotification({
        type: 'error',
        category: 'flow',
        title: 'Erro na Execução do Fluxo',
        message: `O fluxo falhou após ${maxRetries} tentativas: ${error.message}`,
        actionable: true,
      });

      console.error('Execução falhou após esgotar tentativas:', error);
    }
  };

  const scheduleNextStep = useCallback(async (executionId: string, nextNodeId: string) => {
    await supabase
      .from('flow_executions')
      .update({
        current_node: nextNodeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);
  }, []);

  return {
    processing,
    executeFlowStep,
    scheduleNextStep,
  };
};
