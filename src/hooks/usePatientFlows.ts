
import { useState, useEffect, useCallback } from 'react';
import { PatientFlowExecution, PatientFlowStep } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePatientFlows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<PatientFlowExecution[]>([]);
  const [steps, setSteps] = useState<PatientFlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatientFlows = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: flowExecutions, error: flowError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (flowError) {
        console.error('Erro ao carregar execuções:', flowError);
        toast({
          title: "Erro ao carregar fluxos",
          description: "Não foi possível carregar seus fluxos",
          variant: "destructive",
        });
        return;
      }

      const transformedExecutions: PatientFlowExecution[] = (flowExecutions || []).map(execution => {
        // Map database status to frontend status
        let mappedStatus: 'em-andamento' | 'pausado' | 'concluido' | 'aguardando' = 'aguardando';
        switch (execution.status) {
          case 'in-progress':
            mappedStatus = 'em-andamento';
            break;
          case 'failed':
          case 'paused':
            mappedStatus = 'pausado';
            break;
          case 'completed':
            mappedStatus = 'concluido';
            break;
          case 'pending':
          default:
            // If it's pending but has steps and progress is 0, it should be active
            const currentStepData = execution.current_step as any;
            if (currentStepData?.steps && 
                Array.isArray(currentStepData.steps) && 
                currentStepData.steps.length > 0 &&
                execution.progress === 0) {
              mappedStatus = 'em-andamento';
            } else {
              mappedStatus = 'aguardando';
            }
            break;
        }

        const currentStepDataForLog = execution.current_step as any;
        console.log('usePatientFlows: Transforming execution:', {
          id: execution.id,
          originalStatus: execution.status,
          mappedStatus,
          progress: execution.progress,
          hasSteps: currentStepDataForLog?.steps?.length > 0
        });

        return {
          id: execution.id,
          flow_id: execution.flow_id,
          flow_name: execution.flow_name,
          paciente_id: execution.patient_id,
          status: mappedStatus,
          no_atual: execution.current_node,
          progresso: execution.progress,
          started_at: execution.started_at,
          completed_at: execution.completed_at || undefined,
          next_step_available_at: execution.next_step_available_at || undefined,
          current_step: execution.current_step as any,
          total_steps: execution.total_steps,
          completed_steps: execution.completed_steps,
        };
      });

      setExecutions(transformedExecutions);

      // Extract steps from execution metadata instead of separate table
      const transformedSteps: PatientFlowStep[] = [];
      transformedExecutions.forEach(execution => {
        const currentStepData = execution.current_step as any;
        if (currentStepData?.steps) {
          currentStepData.steps.forEach((step: any) => {
            transformedSteps.push({
              id: `${execution.id}-${step.nodeId}`,
              execution_id: execution.id,
              node_id: step.nodeId,
              node_type: step.nodeType,
              title: step.title,
              description: step.description || undefined,
              status: step.completed ? 'concluido' : 'disponivel',
              completed_at: step.completed_at || undefined,
              available_at: step.availableAt || undefined,
              form_url: step.formId ? `/forms/${step.formId}?execution=${execution.id}` : undefined,
              response: step.response || undefined,
            });
          });
        }
      });
      
      setSteps(transformedSteps);

    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const completeStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    if (!user?.id) return;

    try {
      console.log('🔄 usePatientFlows: Iniciando completeStep', { executionId, stepId, response });

      const { data: execution, error: fetchError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (fetchError || !execution) {
        throw new Error('Execução não encontrada');
      }

      console.log('📊 usePatientFlows: Execução encontrada', { 
        currentStatus: execution.status,
        currentProgress: execution.progress,
        totalSteps: execution.total_steps,
        completedSteps: execution.completed_steps
      });

      const newCompletedSteps = execution.completed_steps + 1;
      const newProgress = Math.round((newCompletedSteps / execution.total_steps) * 100);
      const isFormCompleted = newProgress >= 100;
      const newStatus = isFormCompleted ? 'completed' : execution.status;

      console.log('📈 usePatientFlows: Calculando novo progresso', {
        newCompletedSteps,
        newProgress,
        isFormCompleted,
        newStatus
      });

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          completed_steps: newCompletedSteps,
          progress: newProgress,
          status: newStatus,
          completed_at: isFormCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      // Store response in execution metadata if provided
      if (response && stepId) {
        const currentStepData = execution.current_step as any;
        const updatedStep = {
          ...currentStepData,
          response: response,
          completed: true,
          completed_at: new Date().toISOString()
        };

        await supabase
          .from('flow_executions')
          .update({
            current_step: updatedStep,
            updated_at: new Date().toISOString(),
          })
          .eq('id', executionId);
      }

      // ✨ NOVO: Trigger FormEnd processing se o formulário foi completado
      if (isFormCompleted) {
        console.log('🎯 usePatientFlows: Formulário completado, processando FormEnd...');
        
        try {
          // Buscar o flow para encontrar o nó FormEnd
          const { data: flow } = await supabase
            .from('flows')
            .select('nodes')
            .eq('id', execution.flow_id)
            .single();

          if (flow?.nodes) {
            const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
            const formEndNode = nodes.find((node: any) => node.type === 'formEnd');
            
            if (formEndNode && typeof formEndNode === 'object' && formEndNode !== null) {
              console.log('🎉 usePatientFlows: Nó FormEnd encontrado, dados do nó:', (formEndNode as any).data);
              
              // Chamar diretamente a função processFormEndNode do engine
              const formEndNodeData = (formEndNode as any).data;
              console.log('📋 usePatientFlows: Processando FormEnd com dados:', formEndNodeData);
              
              // ✨ CORRIGIDO: Suporte para `arquivo` e `arquivos`, normalização de URLs
              let processedFiles = [];
              
              // Tratar tanto formato antigo (arquivo) quanto novo (arquivos)
              if (formEndNodeData?.arquivos && Array.isArray(formEndNodeData.arquivos) && formEndNodeData.arquivos.length > 0) {
                processedFiles = formEndNodeData.arquivos;
              } else if (formEndNodeData?.arquivo) {
                // Converter formato antigo para novo
                processedFiles = [{
                  id: crypto.randomUUID(),
                  nome: formEndNodeData.arquivo,
                  url: formEndNodeData.arquivo,
                  tipo: formEndNodeData.tipoConteudo || 'application/pdf',
                  tamanho: 0
                }];
              }
              
              if (processedFiles.length > 0) {
                console.log('📁 usePatientFlows: Arquivos encontrados para processamento:', processedFiles.length);
                
                // ✨ NOVO: Normalizar URLs dos arquivos antes de enviar
                const normalizedFiles = processedFiles.map((file: any) => {
                  let fileUrl = file.url || file.nome;
                  
                  // Se for apenas um nome de arquivo, construir URL completa
                  if (!fileUrl.startsWith('http')) {
                    fileUrl = `https://oilnybhaboefqyhjrmvl.supabase.co/storage/v1/object/public/flow-documents/${fileUrl}`;
                  }
                  
                  // Remover URLs duplicadas (https://...https://...)
                  if (fileUrl.includes('https://') && fileUrl.indexOf('https://') !== fileUrl.lastIndexOf('https://')) {
                    const parts = fileUrl.split('https://');
                    fileUrl = 'https://' + parts[parts.length - 1];
                  }
                  
                  return {
                    id: file.id || crypto.randomUUID(),
                    nome: file.nome || file.arquivo || 'documento.pdf',
                    url: fileUrl,
                    tipo: file.tipo || file.tipoConteudo || 'application/pdf',
                    tamanho: file.tamanho || 0
                  };
                });
                
                console.log('🔧 usePatientFlows: Arquivos normalizados:', normalizedFiles);
                
                // Gerar URL de conteúdo diretamente
                try {
                  console.log('🔗 usePatientFlows: Chamando edge function generate-content-url...');
                  
                  const { data: urlData, error: urlError } = await supabase.functions.invoke('generate-content-url', {
                    body: {
                      executionId,
                      files: normalizedFiles
                    }
                  });
                  
                  if (urlError) {
                    console.error('❌ usePatientFlows: Erro na edge function:', urlError);
                    throw urlError;
                  }
                  
                  const contentUrl = urlData?.url;
                  
                  if (contentUrl) {
                    console.log('🔗 usePatientFlows: URL de conteúdo gerada:', contentUrl);
                    
                    // Buscar dados do paciente
                    const { data: patient } = await supabase
                      .from('profiles')
                      .select('name, phone')
                      .eq('user_id', execution.patient_id)
                      .single();
                    
                    if (patient?.phone) {
                      console.log('📱 usePatientFlows: Enviando WhatsApp para:', patient.phone);
                      
                      // Buscar configurações do WhatsApp
                      const { data: whatsappConfig } = await supabase
                        .from('whatsapp_settings')
                        .select('*')
                        .eq('is_active', true)
                        .single();
                      
                      if (whatsappConfig) {
                        // Buscar template
                        const { data: template } = await supabase
                          .from('whatsapp_templates')
                          .select('*')
                          .eq('name', 'formulario_concluido')
                          .eq('is_active', true)
                          .single();
                        
                        if (template) {
                          console.log('📋 usePatientFlows: Template encontrado, enviando mensagem...');
                          
                          // Preparar conteúdo da mensagem
                          let messageContent = template.content;
                          messageContent = messageContent.replace('{patient_name}', patient.name || 'Paciente');
                          messageContent = messageContent.replace('{content_url}', contentUrl);
                          
                          // Enviar mensagem através da API direta
                          try {
                            const phoneNumber = patient.phone.replace(/\D/g, ''); // Remove caracteres não numéricos
                            const whatsappPayload = {
                              phone: phoneNumber,
                              message: messageContent
                            };
                            
                            console.log('📤 usePatientFlows: Enviando payload:', whatsappPayload);
                            
                            // Importar e usar o serviço WhatsApp existente
                            const { whatsappService } = await import('@/services/whatsapp/WhatsAppService');
                            whatsappService.setConfig({
                              provider: whatsappConfig.provider as any,
                              access_token: whatsappConfig.access_token,
                              phone_number: whatsappConfig.phone_number,
                              business_account_id: whatsappConfig.business_account_id,
                              base_url: whatsappConfig.base_url,
                              api_key: whatsappConfig.api_key,
                              session_name: whatsappConfig.session_name,
                              account_sid: whatsappConfig.account_sid,
                              auth_token: whatsappConfig.auth_token,
                              webhook_url: whatsappConfig.webhook_url,
                              is_active: whatsappConfig.is_active
                            });
                            
                            const mockResult = await whatsappService.sendMessage(phoneNumber, messageContent);
                            
                            console.log('📊 usePatientFlows: Resultado envio WhatsApp:', mockResult);
                            
                            if (mockResult.success) {
                              console.log('✅ usePatientFlows: Mensagem WhatsApp enviada com sucesso');
                              
                              // Registrar atividade
                              await supabase.from('notifications').insert({
                                user_id: execution.patient_id,
                                title: 'Formulário Concluído',
                                message: `Material disponível para download`,
                                type: 'success',
                                category: 'form_completion',
                                metadata: {
                                  execution_id: executionId,
                                  content_url: contentUrl,
                                  whatsapp_sent: true
                                }
                              });
                            }
                          } catch (sendError) {
                            console.error('❌ usePatientFlows: Erro ao enviar WhatsApp:', sendError);
                          }
                        } else {
                          console.warn('⚠️ usePatientFlows: Template formulario_concluido não encontrado');
                        }
                      } else {
                        console.warn('⚠️ usePatientFlows: Configurações WhatsApp não encontradas');
                      }
                    } else {
                      console.warn('⚠️ usePatientFlows: Paciente sem telefone configurado');
                    }
                  } else {
                    console.error('❌ usePatientFlows: Falha ao gerar URL de conteúdo');
                  }
                } catch (urlError) {
                  console.error('❌ usePatientFlows: Erro ao gerar URL:', urlError);
                }
              } else {
                console.warn('⚠️ usePatientFlows: Nenhum arquivo encontrado no nó FormEnd');
              }
              
              console.log('✅ usePatientFlows: Processamento FormEnd concluído');
            } else {
              console.warn('⚠️ usePatientFlows: Nó FormEnd não encontrado no flow');
            }
          }
        } catch (endError) {
          console.error('❌ usePatientFlows: Erro ao processar FormEnd:', endError);
          console.error('❌ usePatientFlows: Stack trace:', endError.stack);
          // Não falhar toda a operação por causa do FormEnd
        }
      }

      await loadPatientFlows();

      toast({
        title: "Etapa concluída",
        description: "Sua resposta foi registrada com sucesso",
      });

    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast({
        title: "Erro ao completar etapa",
        description: "Não foi possível registrar sua resposta",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, loadPatientFlows, toast]);

  const getTimeUntilAvailable = useCallback((availableAt: string) => {
    const now = new Date();
    const available = new Date(availableAt);
    const diff = available.getTime() - now.getTime();
    
    if (diff <= 0) return 'Disponível agora';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Disponível em ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Disponível em ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Disponível em breve';
  }, []);

  useEffect(() => {
    if (user?.role === 'patient') {
      loadPatientFlows();
    } else {
      setLoading(false);
    }
  }, [user, loadPatientFlows]);

  return {
    executions,
    steps,
    loading,
    completeStep,
    getTimeUntilAvailable,
    refetch: loadPatientFlows,
  };
};
