import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppValidations } from '@/hooks/useWhatsAppValidations';

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
  const { sendMessage } = useWhatsApp();
  const { recordOptInActivity } = useWhatsAppValidations();
  const [processing, setProcessing] = useState(false);

  const executeFlowStep = useCallback(async (
    executionId: string,
    step: ExecutionStep,
    nodeData: any
  ) => {
    console.log(`🔄 FlowEngine: Executando etapa ${step.nodeType}:`, { executionId, step, nodeData });

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

      console.log(`✅ FlowEngine: Etapa ${step.nodeType} executada com sucesso`);
      return { success: true };
    } catch (error) {
      console.error(`❌ FlowEngine: Erro ao executar etapa ${step.nodeType}:`, error);
      await handleStepError(executionId, step, error as Error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const processStartNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    console.log('🚀 FlowEngine: Processando nó de início do fluxo');
    
    await supabase
      .from('flow_executions')
      .update({
        status: 'em-andamento',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    // Buscar dados da execução para obter o patient_id
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('patient_id, flow_name')
      .eq('id', executionId)
      .single();

    if (execution) {
      console.log('📱 FlowEngine: Enviando notificação de início do fluxo via WhatsApp');

      try {
        // 🎯 USAR LINK FIXO DO FITCLUB para o início do fluxo
        console.log('📱 FlowEngine: Enviando notificação de início do fluxo...');
        
        const { data: response, error } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            patientId: (execution as any).patient_id,
            executionId: executionId,
            message: `🎯 Seu fluxo "${(execution as any).flow_name}" foi iniciado!\n\n📱 Acesse o app: https://fitclub.app.br/\n\n_Continue quando estiver pronto._`,
            continueLink: 'https://fitclub.app.br/'
          }
        });

        if (error) {
          console.error('❌ FlowEngine: Erro na Edge Function de notificação:', error);
        } else {
          console.log('✅ FlowEngine: Notificação de início do fluxo enviada com sucesso:', response);
        }
      } catch (error) {
        console.error('❌ FlowEngine: Erro ao chamar Edge Function de notificação:', error);
      }
    } else {
      console.error('❌ FlowEngine: Execução não encontrada');
    }

    console.log('🚀 FlowEngine: Nó de início processado');
  };

  const processFormStartNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    console.log('📝 FlowEngine: Processando FormStart node', { executionId, nodeData });
    
    // Update execution status to active and set progress
    await supabase
      .from('flow_executions')
      .update({
        status: 'in-progress',
        progress: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    // Buscar dados da execução para obter o patient_id
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('patient_id, flow_name')
      .eq('id', executionId)
      .single();

    if (execution) {
      console.log('📞 FlowEngine: Enviando notificação de novo formulário via WhatsApp');

      try {
        // 🚀 USAR NOVA EDGE FUNCTION PARA NOTIFICAÇÃO DE FORMULÁRIO
        console.log('📱 FlowEngine: Enviando via Edge Function send-form-notification...');
        
        const { data: response, error } = await supabase.functions.invoke('send-form-notification', {
          body: {
            patientId: (execution as any).patient_id,
            formName: nodeData.titulo || (execution as any).flow_name || 'Formulário',
            executionId: executionId
          }
        });

        if (error) {
          console.error('❌ FlowEngine: Erro na Edge Function de notificação:', error);
        } else {
          console.log('✅ FlowEngine: Notificação de formulário enviada com sucesso:', response);
        }
      } catch (error) {
        console.error('❌ FlowEngine: Erro ao chamar Edge Function de notificação:', error);
      }
    } else {
      console.error('❌ FlowEngine: Execução não encontrada');
    }

    console.log('📝 FlowEngine: FormStart processado');
  };

  const processFormEndNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    console.log('🏁 FlowEngine: ===== INICIANDO PROCESSAMENTO FORMEND =====');
    console.log('🏁 FlowEngine: Processando FormEnd node', { executionId, nodeData });
    
    try {
      // Buscar dados da execução
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('patient_id')
        .eq('id', executionId)
        .single();

      if (!execution) {
        console.error('❌ FlowEngine: Execução não encontrada');
        return;
      }

      // Normalizar arquivos para usar apenas clinic-materials
      const arquivosNormalizados = (nodeData.arquivos || []).map((arquivo: any) => {
        let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
        
        // Corrigir URLs duplicadas
        if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
          const parts = cleanUrl.split('https://');
          cleanUrl = 'https://' + parts[parts.length - 1];
        }
        
        // Forçar uso apenas do bucket clinic-materials
        if (cleanUrl.includes('/flow-documents/')) {
          cleanUrl = cleanUrl.replace('/flow-documents/', '/clinic-materials/');
        }
        
        return {
          id: arquivo.id || arquivo.document_id,
          nome: arquivo.original_filename || arquivo.filename || arquivo.nome || 'Arquivo',
          url: cleanUrl,
          tipo: arquivo.file_type || arquivo.tipo || 'application/octet-stream',
          tamanho: arquivo.file_size || arquivo.tamanho || 0,
          original_filename: arquivo.original_filename || arquivo.filename || arquivo.nome,
          file_url: cleanUrl,
          file_type: arquivo.file_type || arquivo.tipo,
          file_size: arquivo.file_size || arquivo.tamanho
        };
      });

      console.log('📁 FlowEngine: Arquivos normalizados:', arquivosNormalizados);

      // 🚀 USAR APENAS A EDGE FUNCTION SEND-WHATSAPP
      if (arquivosNormalizados.length > 0) {
        console.log('📱 FlowEngine: Enviando via Edge Function send-whatsapp...');
        
        try {
          const { data: response, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              patientId: (execution as any).patient_id,
              executionId: executionId,
              files: arquivosNormalizados
            }
          });

          if (error) {
            console.error('❌ FlowEngine: Erro na Edge Function:', error);
          } else {
            console.log('✅ FlowEngine: Edge Function executada com sucesso:', response);
          }
        } catch (error) {
          console.error('❌ FlowEngine: Erro ao chamar Edge Function:', error);
        }
      } else {
        console.log('📝 FlowEngine: Nenhum arquivo para enviar');
      }

      console.log('🏁 FlowEngine: FormEnd processado com sucesso');
      
    } catch (error) {
      console.error('❌ FlowEngine: Erro crítico no processFormEndNode:', error);
      throw error;
    }
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
        next_step_available_at: nextExecutionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    console.log('Delay programado para:', nextExecutionDate);
  };

  const processQuestionNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    // Store question info in execution metadata
    await supabase
      .from('flow_executions')
      .update({
        current_step: {
          nodeId: step.nodeId,
          nodeType: step.nodeType,
          title: nodeData.pergunta || 'Pergunta',
          description: 'Responda a pergunta para continuar',
          status: 'disponivel'
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

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
      .eq('user_id', (execution as any).patient_id)
      .single();

    // Store WhatsApp message info in execution metadata
    await supabase
      .from('flow_executions')
      .update({
        current_step: {
          nodeId: step.nodeId,
          nodeType: step.nodeType,
          phone: nodeData.telefone || '',
          message: nodeData.mensagem || '',
          status: 'pending'
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

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

    console.log('Fluxo finalizado');
  };

  const handleStepError = async (executionId: string, step: ExecutionStep, error: Error) => {
    console.error(`Erro na etapa ${step.nodeType}:`, error);

    await supabase
      .from('flow_executions')
      .update({
        status: 'falha',
        current_step: {
          ...step,
          status: 'failed',
          error: error.message
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    createNotification({
      type: 'error',
      category: 'flow',
      title: 'Erro no Fluxo',
      message: `Erro na etapa ${step.nodeType}: ${error.message}`,
      actionable: true,
    });
  };

  const completeCurrentStep = useCallback(async (
    executionId: string,
    response: any
  ) => {
    try {
      setProcessing(true);

      const { data: execution } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (!execution) {
        throw new Error('Execução não encontrada');
      }

      // Update step completion
      const currentStep = execution.current_step || {};
      await supabase
        .from('flow_executions')
        .update({
          current_step: {
            ...(typeof currentStep === 'object' ? currentStep : {}),
            response,
            status: 'completed',
            completed_at: new Date().toISOString()
          },
          progress: Math.min((execution.progress || 0) + 10, 100),
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      toast({
        title: "Etapa concluída",
        description: "Sua resposta foi salva com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua resposta. Tente novamente.",
        variant: "destructive",
      });
      return { success: false, error: (error as Error).message };
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  return {
    executeFlowStep,
    completeCurrentStep,
    processing
  };
};
