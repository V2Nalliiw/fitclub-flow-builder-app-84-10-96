
import { useState, useCallback, useEffect } from 'react';
import { FlowNode } from '@/types/flow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useContentUrlGenerator } from '@/hooks/useContentUrlGenerator';
import { useWhatsAppValidations } from '@/hooks/useWhatsAppValidations';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { usePatientWhatsApp } from '@/hooks/usePatientWhatsApp';

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
  const { sendWhatsAppTemplateMessage, sendMessage } = useWhatsApp();
  const { generateContentUrl } = useContentUrlGenerator();
  const { validateWhatsAppSending, recordOptInActivity } = useWhatsAppValidations();
  const { sendFormToPatient } = usePatientWhatsApp();
  const [processing, setProcessing] = useState(false);
  
  // Aguardar configurações do WhatsApp estarem prontas
  const { loading: whatsappLoading, getWhatsAppConfig } = useWhatsAppSettings();
  const [isWhatsAppReady, setIsWhatsAppReady] = useState(false);
  
  // Verificar se WhatsApp está pronto para uso
  useEffect(() => {
    if (!whatsappLoading) {
      const config = getWhatsAppConfig();
      const ready = !!config && config.is_active;
      console.log('🔧 FlowEngine: WhatsApp ready status:', { 
        loading: whatsappLoading, 
        config: !!config, 
        active: config?.is_active, 
        ready 
      });
      setIsWhatsAppReady(ready);
    }
  }, [whatsappLoading, getWhatsAppConfig]);

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
    console.log('📝 FlowEngine: Processando FormStart node', { executionId, nodeData });
    
    const formUrl = `${window.location.origin}/forms/${step.nodeId}?execution=${executionId}`;
    
    // Store form info in execution metadata
    await supabase
      .from('flow_executions')
      .update({
        current_step: {
          nodeId: step.nodeId,
          nodeType: step.nodeType,
          title: nodeData.titulo || 'Formulário',
          description: nodeData.descricao,
          formUrl: formUrl,
          status: 'disponivel'
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    // Buscar dados da execução para obter o patient_id
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('patient_id')
      .eq('id', executionId)
      .single();

    if (execution) {
      console.log('📞 FlowEngine: Enviando formulário via WhatsApp para paciente', { 
        patientId: (execution as any).patient_id,
        formName: nodeData.titulo || 'Formulário',
        formUrl: formUrl
      });

      try {
        // Buscar dados do paciente diretamente
        const { data: patient } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('user_id', (execution as any).patient_id)
          .single();

        if (patient && (patient as any).phone) {
          console.log('📞 FlowEngine: Enviando link do painel via WhatsApp', { 
            patientId: (execution as any).patient_id,
            phone: (patient as any).phone,
            formName: nodeData.titulo || 'Formulário'
          });

          // Enviar link do painel do paciente (onde a primeira pergunta aparecerá automaticamente)
          const patientDashboardUrl = `${window.location.origin}/patient-dashboard`;
          const customMessage = `📋 *${nodeData.titulo || 'Formulário'}*\n\nOlá ${(patient as any).name}! Você tem um novo formulário para preencher.\n\n🔗 Acesse seu painel: ${patientDashboardUrl}\n\n_O formulário aparecerá automaticamente quando você abrir o link._`;
          
          // Usar sendMessage diretamente com validação
          const validation = await validateWhatsAppSending(
            (patient as any).phone,
            'novo_formulario',
            (execution as any).patient_id
          );

          if (validation.canSend) {
            // Aguardar WhatsApp estar pronto
            if (!isWhatsAppReady) {
              console.log('⏳ FlowEngine: Aguardando WhatsApp ficar pronto...');
              let attempts = 0;
              const maxAttempts = 20;
              
              while (!isWhatsAppReady && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
              }
              
              if (!isWhatsAppReady) {
                console.error('❌ FlowEngine: WhatsApp não ficou pronto a tempo');
                return;
              }
            }

            const result = await sendMessage((patient as any).phone, customMessage);
            
            console.log('📱 FlowEngine: Resultado do envio do link do painel:', result);
            
            if (result.success) {
              await recordOptInActivity(
                (execution as any).patient_id,
                (patient as any).phone,
                'whatsapp_sent'
              );
              console.log('✅ FlowEngine: Link do painel enviado com sucesso via WhatsApp');
            } else {
              console.error('❌ FlowEngine: Falha no envio do link do painel:', result.error);
            }
          } else {
            console.warn('⚠️ FlowEngine: Envio WhatsApp bloqueado:', validation.reason);
          }
        } else {
          console.warn('⚠️ FlowEngine: Paciente sem telefone configurado');
        }
      } catch (error) {
        console.error('❌ FlowEngine: Erro ao enviar link do painel via WhatsApp:', error);
      }
    } else {
      console.error('❌ FlowEngine: Execução não encontrada');
    }

    console.log('📝 FlowEngine: Formulário criado:', formUrl);
  };

  const processFormEndNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    console.log('🏁 FlowEngine: Processando FormEnd node', { executionId, nodeData });
    
    // Buscar dados da execução e do paciente
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('patient_id')
      .eq('id', executionId)
      .single();

    if (execution) {
      const { data: patient } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('user_id', (execution as any).patient_id)
        .single();

      if (patient && (patient as any).phone) {
        console.log('📞 FlowEngine: Enviando WhatsApp de conclusão para paciente', { 
          patientId: (execution as any).patient_id,
          phone: (patient as any).phone,
          template: 'formulario_concluido'
        });

        // Gerar URL de conteúdo se houver arquivos configurados
        let contentUrl = '';
        
        if (nodeData.arquivos && nodeData.arquivos.length > 0) {
          console.log('📁 FlowEngine: Gerando URL para arquivos:', nodeData.arquivos.length);
          contentUrl = await generateContentUrl({
            executionId,
            files: nodeData.arquivos
          }) || '';
        }

        // Se não houver URL de conteúdo, usar URL padrão
        if (!contentUrl) {
          contentUrl = `${window.location.origin}/conteudo-formulario/${executionId}`;
        }

        console.log('🔗 FlowEngine: URL de conteúdo gerada:', contentUrl);

        // Validar antes de enviar
        const validation = await validateWhatsAppSending(
          (patient as any).phone,
          'formulario_concluido',
          (execution as any).patient_id
        );

        console.log('✅ FlowEngine: Resultado da validação WhatsApp:', validation);

        if (validation.canSend) {
          // Aguardar WhatsApp estar pronto antes de enviar
          if (!isWhatsAppReady) {
            console.log('⏳ FlowEngine: Aguardando WhatsApp ficar pronto para FormEnd...');
            
            // Esperar até 10 segundos pelo WhatsApp ficar pronto
            let attempts = 0;
            const maxAttempts = 20; // 10 segundos (500ms x 20)
            
            while (!isWhatsAppReady && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
              attempts++;
              console.log(`⏳ FlowEngine: Tentativa ${attempts}/${maxAttempts} - WhatsApp ready: ${isWhatsAppReady}`);
            }
            
            if (!isWhatsAppReady) {
              console.error('❌ FlowEngine: Timeout - WhatsApp não ficou pronto a tempo para FormEnd');
              throw new Error('WhatsApp não está pronto para envio');
            }
          }
          
          try {
            console.log('🚀 FlowEngine: Enviando template formulario_concluido...');
            
            const result = await sendWhatsAppTemplateMessage(
              (patient as any).phone,
              'formulario_concluido',
              {
                patient_name: (patient as any).name || 'Paciente',
                content_url: contentUrl
              }
            );
            
            console.log('📱 FlowEngine: Resultado do envio:', result);
            
            if (result.success) {
              // Registrar atividade de envio
              await recordOptInActivity(
                (execution as any).patient_id,
                (patient as any).phone,
                'whatsapp_sent'
              );
              
              console.log('✅ FlowEngine: Template formulario_concluido enviado com sucesso');
            } else {
              console.error('❌ FlowEngine: Falha no envio do template:', result.error);
              
              // Tentar novamente após delay se for erro de configuração
              if (result.error?.includes('não configurado')) {
                console.log('🔄 FlowEngine: Tentando reenvio após delay...');
                setTimeout(async () => {
                  try {
                    const retryResult = await sendWhatsAppTemplateMessage(
                      (patient as any).phone,
                      'formulario_concluido',
                      {
                        patient_name: (patient as any).name || 'Paciente',
                        content_url: contentUrl
                      }
                    );
                    console.log('🔄 FlowEngine: Resultado do reenvio:', retryResult);
                  } catch (retryError) {
                    console.error('❌ FlowEngine: Falha no reenvio:', retryError);
                  }
                }, 3000);
              }
            }
          } catch (error) {
            console.error('❌ FlowEngine: Erro ao enviar template formulario_concluido:', error);
          }
        } else {
          console.warn('⚠️ FlowEngine: Envio WhatsApp bloqueado:', validation.reason);
        }
      } else {
        console.warn('⚠️ FlowEngine: Paciente sem telefone configurado');
      }
    } else {
      console.error('❌ FlowEngine: Execução não encontrada');
    }

    console.log('🏁 FlowEngine: Fim de formulário processado');
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

    console.log('Fluxo finalizado com sucesso');
  };

  const handleStepError = async (executionId: string, step: ExecutionStep, error: Error) => {
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    const currentRetryCount = (execution as any)?.retry_count || 0;
    const maxRetries = 3;

    if (currentRetryCount < maxRetries) {
      // Incrementar contador de tentativas e reagendar
      await supabase
        .from('flow_executions')
        .update({
          current_step: {
            ...(execution as any)?.current_step,
            retry_count: currentRetryCount + 1,
            error_message: error.message,
            scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          },
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
          current_step: {
            ...(execution as any)?.current_step,
            error_message: error.message
          },
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
