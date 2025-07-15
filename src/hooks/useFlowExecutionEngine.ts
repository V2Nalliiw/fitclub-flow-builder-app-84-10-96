import { useState, useCallback, useEffect } from 'react';
import { FlowNode } from '@/types/flow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppValidations } from '@/hooks/useWhatsAppValidations';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { usePatientWhatsApp } from '@/hooks/usePatientWhatsApp';
import { whatsappService } from '@/services/whatsapp/WhatsAppService';
import { whatsappTemplateService } from '@/services/whatsapp/WhatsAppTemplateService';

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
  const { validateWhatsAppSending, recordOptInActivity } = useWhatsAppValidations();
  const { sendFormToPatient } = usePatientWhatsApp();
  const [processing, setProcessing] = useState(false);
  
  // Aguardar configurações do WhatsApp estarem prontas
  const { loading: whatsappLoading, getWhatsAppConfig } = useWhatsAppSettings();
  const [isWhatsAppReady, setIsWhatsAppReady] = useState(false);
  
  // Verificar se WhatsApp está pronto para uso
  useEffect(() => {
    const checkWhatsAppReady = () => {
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
        
        // Configurar WhatsApp service se configuração estiver disponível
        if (config && config.is_active) {
          whatsappService.setConfig({
            provider: config.provider,
            access_token: config.access_token,
            business_account_id: config.business_account_id,
            phone_number: config.phone_number,
            webhook_url: config.webhook_url,
            base_url: config.base_url,
            api_key: config.api_key,
            session_name: config.session_name,
            account_sid: config.account_sid,
            auth_token: config.auth_token,
            is_active: config.is_active
          });
          console.log('✅ FlowEngine: WhatsApp service configurado');
        }
        
        // Se não estiver pronto, tentar novamente em 2 segundos
        if (!ready && !whatsappLoading) {
          setTimeout(checkWhatsAppReady, 2000);
        }
      }
    };
    
    checkWhatsAppReady();
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
      .select('patient_id')
      .eq('id', executionId)
      .single();

    if (execution) {
      console.log('📞 FlowEngine: Enviando formulário via WhatsApp para paciente', { 
        patientId: (execution as any).patient_id,
        formName: nodeData.titulo || 'Formulário'
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

          // Enviar link do painel principal diretamente
          const patientDashboardUrl = `${window.location.origin}/`;
          const customMessage = `📋 *${nodeData.titulo || 'Formulário'}*\n\nOlá ${(patient as any).name}! Você tem um novo formulário para preencher.\n\n🔗 Acesse aqui: ${patientDashboardUrl}\n\n_O formulário aparecerá automaticamente quando você abrir o link._`;
          
          // Simplificar validação - enviar imediatamente
          console.log('🚀 FlowEngine: Enviando link do painel via WhatsApp imediatamente...');
          
          // Implementar retry robusto com múltiplas tentativas
          const sendWithRetry = async (attempts = 5) => {
            for (let i = 0; i < attempts; i++) {
              try {
                console.log(`📱 FlowEngine: Enviando via WhatsApp (tentativa ${i + 1}/${attempts})...`);
                const result = await sendMessage((patient as any).phone, customMessage);
                
                console.log('📱 FlowEngine: Resultado do envio:', result);
                
                if (result.success) {
                  await recordOptInActivity(
                    (execution as any).patient_id,
                    (patient as any).phone,
                    'whatsapp_sent'
                  );
                  console.log('✅ FlowEngine: Link do painel enviado com sucesso via WhatsApp');
                  return true;
                } else {
                  console.error(`❌ FlowEngine: Falha no envio (tentativa ${i + 1}):`, result.error);
                  if (i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000)); // Delay progressivo mais rápido
                  }
                }
              } catch (error) {
                console.error(`❌ FlowEngine: Erro no envio (tentativa ${i + 1}):`, error);
                if (i < attempts - 1) {
                  await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                }
              }
            }
            console.error('❌ FlowEngine: Falha após todas as tentativas de envio');
            return false;
          };
          
          // Executar envio sem await para não bloquear
          sendWithRetry();
        } else {
          console.warn('⚠️ FlowEngine: Paciente sem telefone configurado');
        }
      } catch (error) {
        console.error('❌ FlowEngine: Erro ao enviar link do painel via WhatsApp:', error);
      }
    } else {
      console.error('❌ FlowEngine: Execução não encontrada');
    }

    console.log('📝 FlowEngine: FormStart processado');
  };

  const processFormEndNode = async (executionId: string, step: ExecutionStep, nodeData: any) => {
    console.log('🏁 FlowEngine: ===== INICIANDO PROCESSAMENTO FORMEND =====');
    console.log('🏁 FlowEngine: Processando FormEnd node', { executionId, nodeData });
    console.log('🏁 FlowEngine: Step completo:', step);
    
    try {
      // Buscar dados da execução e do paciente
      console.log('🔍 FlowEngine: Buscando dados da execução...');
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('patient_id')
        .eq('id', executionId)
        .single();

      console.log('🔍 FlowEngine: Resultado da busca de execução:', execution);

      if (!execution) {
        console.error('❌ FlowEngine: Execução não encontrada');
        return;
      }

      console.log('🔍 FlowEngine: Buscando dados do paciente...');
      const { data: patient } = await supabase
        .from('profiles')
        .select('name, phone, clinic_id')
        .eq('user_id', (execution as any).patient_id)
        .single();

      console.log('🔍 FlowEngine: Resultado da busca de paciente:', patient);

      if (!patient) {
        console.error('❌ FlowEngine: Paciente não encontrado');
        return;
      }

      // ✨ CORRIGIR ESTRUTURA DOS ARQUIVOS
      const arquivosNormalizados = (nodeData.arquivos || []).map((arquivo: any) => {
        // Normalizar URL - remover duplicações e corrigir bucket
        let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
        
        // Corrigir URLs duplicadas
        if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
          const parts = cleanUrl.split('https://');
          cleanUrl = 'https://' + parts[parts.length - 1];
        }
        
        // Forçar uso do bucket clinic-materials (padrão)
        if (cleanUrl.includes('/flow-documents/')) {
          cleanUrl = cleanUrl.replace('/flow-documents/', '/clinic-materials/');
        }
        
        return {
          id: arquivo.id || arquivo.document_id,
          nome: arquivo.original_filename || arquivo.filename || arquivo.nome || 'Arquivo',
          url: cleanUrl,
          tipo: arquivo.file_type || arquivo.tipo || 'application/octet-stream',
          tamanho: arquivo.file_size || arquivo.tamanho || 0,
          // Informações adicionais para compatibilidade
          original_filename: arquivo.original_filename || arquivo.filename || arquivo.nome,
          file_url: cleanUrl,
          file_type: arquivo.file_type || arquivo.tipo,
          file_size: arquivo.file_size || arquivo.tamanho
        };
      });

      console.log('📁 FlowEngine: Arquivos normalizados:', arquivosNormalizados);

      // ✨ CRIAR REGISTRO DE ACESSO OBRIGATÓRIO
      let contentUrl = '';
      let accessToken = '';
      
      if (arquivosNormalizados.length > 0) {
        try {
          // Gerar token e expiração
          accessToken = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias

          console.log('💾 FlowEngine: Criando registro content_access...', {
            execution_id: executionId,
            patient_id: (execution as any).patient_id,
            access_token: accessToken,
            files_count: arquivosNormalizados.length
          });

          const { data: contentAccessData, error: insertError } = await supabase
            .from('content_access')
            .insert({
              execution_id: executionId,
              patient_id: (execution as any).patient_id,
              access_token: accessToken,
              files: arquivosNormalizados,
              expires_at: expiresAt.toISOString(),
              metadata: {
                patient_name: (patient as any).name || 'Paciente',
                flow_name: nodeData.titulo || 'Formulário',
                form_name: nodeData.titulo || 'Formulário',
                created_at: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ FlowEngine: Erro ao inserir content_access:', insertError);
            throw new Error(`Erro ao criar acesso: ${insertError.message}`);
          }

          console.log('✅ FlowEngine: content_access criado com sucesso:', contentAccessData);
          contentUrl = `${window.location.origin}/conteudo-formulario/${executionId}?token=${accessToken}`;
          
        } catch (error) {
          console.error('❌ FlowEngine: Erro crítico ao criar content_access:', error);
          // Criar URL simples como fallback
          contentUrl = `${window.location.origin}/conteudo-formulario/${executionId}`;
        }
      } else {
        console.log('📝 FlowEngine: Nenhum arquivo para enviar, criando URL básica');
        contentUrl = `${window.location.origin}/conteudo-formulario/${executionId}`;
      }

      console.log('🔗 FlowEngine: URL final de conteúdo:', contentUrl);

      // ✨ ENVIAR WHATSAPP COM TEMPLATE OFICIAL
      console.log('🔍 FlowEngine: Verificando condições para envio WhatsApp...');
      console.log('🔍 FlowEngine: Patient existe:', !!patient);
      console.log('🔍 FlowEngine: Patient phone:', patient ? (patient as any).phone : 'N/A');
      
      if (patient && (patient as any).phone) {
        console.log('📱 FlowEngine: ===== INICIANDO ENVIO WHATSAPP =====');
        console.log('📱 FlowEngine: Enviando WhatsApp de conclusão com template oficial...');
        console.log('📱 FlowEngine: Dados do envio:', {
          phone: (patient as any).phone,
          template: 'formulario_concluido',
          variables: {
            patient_name: (patient as any).name || 'Paciente',
            content_url: contentUrl
          }
        });

        // Usar template oficial aprovado
        const sendWithRetry = async (attempts = 3) => {
          console.log(`🔄 FlowEngine: Iniciando retry com ${attempts} tentativas...`);
          
          for (let i = 0; i < attempts; i++) {
            try {
              console.log(`📱 FlowEngine: ===== TENTATIVA ${i + 1}/${attempts} =====`);
              console.log(`📱 FlowEngine: Tentando enviar template "formulario_concluido"...`);
              
              // ✨ CORRIGIDO: Usar placeholders {{1}} e {{2}} para template oficial
              const templateParams = [
                (patient as any).name || 'Paciente',  // {{1}} - Nome do paciente
                contentUrl                             // {{2}} - URL do conteúdo
              ];
              
              console.log(`📧 FlowEngine: Enviando template com parâmetros:`, templateParams);
              
              // Tentar template oficial primeiro via Meta API
              const result = await whatsappService.sendTemplate(
                (patient as any).phone,
                'formulario_concluido',
                templateParams,
                'pt_BR'
              );
              
              console.log(`📱 FlowEngine: Resultado da tentativa ${i + 1}:`, result);
              
              if (result.success) {
                console.log('✅ FlowEngine: Enviando atividade de opt-in...');
                await recordOptInActivity(
                  (execution as any).patient_id,
                  (patient as any).phone,
                  'whatsapp_sent'
                );
                console.log('✅ FlowEngine: WhatsApp template enviado com sucesso!');
                return true;
              } else {
                console.error(`❌ FlowEngine: Falha no template (tentativa ${i + 1}):`, result.error);
                
                // FALLBACK: Tentar com mensagem renderizada
                console.log('🔄 FlowEngine: Tentando fallback com mensagem renderizada...');
                
                const renderedMessage = await whatsappTemplateService.renderTemplate(
                  'formulario_concluido',
                  {
                    patient_name: (patient as any).name || 'Paciente',
                    content_url: contentUrl
                  }
                );
                
                const fallbackResult = await whatsappService.sendMessage(
                  (patient as any).phone,
                  renderedMessage
                );
                
                if (fallbackResult.success) {
                  console.log('✅ FlowEngine: Fallback enviado com sucesso!');
                  await recordOptInActivity(
                    (execution as any).patient_id,
                    (patient as any).phone,
                    'whatsapp_sent'
                  );
                  return true;
                }
                
                if (i < attempts - 1) {
                  console.log(`⏳ FlowEngine: Aguardando ${1000 * (i + 1)}ms antes da próxima tentativa...`);
                  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
              }
            } catch (error) {
              console.error(`❌ FlowEngine: Erro crítico no envio (tentativa ${i + 1}):`, error);
              if (i < attempts - 1) {
                console.log(`⏳ FlowEngine: Aguardando ${1000 * (i + 1)}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
              }
            }
          }
          console.error('❌ FlowEngine: Falha após todas as tentativas');
          return false;
        };
        
        // Executar envio
        console.log('🚀 FlowEngine: Iniciando processo de envio...');
        await sendWithRetry();
      } else {
        console.warn('⚠️ FlowEngine: Paciente sem telefone configurado');
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
    processing,
    isWhatsAppReady
  };
};