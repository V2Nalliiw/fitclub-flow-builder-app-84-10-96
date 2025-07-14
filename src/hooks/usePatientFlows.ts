
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
              
              // ✨ NOVO: Usar o FlowExecutionEngine diretamente
              console.log('🔥 usePatientFlows: Importando FlowExecutionEngine...');
              
              // Usar a função processFormEndNode do engine
              const { useFlowExecutionEngine } = await import('./useFlowExecutionEngine');
              
              // Criar uma instância do hook (precisa ser feito assim para hooks)
              console.log('🚀 usePatientFlows: Executando processFormEndNode via engine...');
              
              // Chamar diretamente a função interna, mas como é um hook, vamos fazer de forma mais simples
              // Vamos replicar a lógica do processFormEndNode aqui mesmo para garantir que funcione
              
              // ✨ EXECUTAR LÓGICA DO FORMEND AQUI MESMO
              try {
                console.log('📁 usePatientFlows: Processando arquivos do FormEnd...', formEndNodeData);
                
                // Normalizar arquivos
                let arquivosNormalizados = [];
                
                if (formEndNodeData?.arquivos && Array.isArray(formEndNodeData.arquivos) && formEndNodeData.arquivos.length > 0) {
                  arquivosNormalizados = formEndNodeData.arquivos.map((arquivo: any) => {
                    let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
                    
                    // Corrigir URLs duplicadas
                    if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
                      const parts = cleanUrl.split('https://');
                      cleanUrl = 'https://' + parts[parts.length - 1];
                    }
                    
                    // Forçar uso do bucket clinic-materials
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
                }
                
                console.log('📋 usePatientFlows: Arquivos normalizados:', arquivosNormalizados);
                
                // Criar registro de content_access
                if (arquivosNormalizados.length > 0) {
                  const accessToken = crypto.randomUUID();
                  const expiresAt = new Date();
                  expiresAt.setDate(expiresAt.getDate() + 30);
                  
                  // Buscar dados do paciente
                  const { data: patient } = await supabase
                    .from('profiles')
                    .select('name, phone')
                    .eq('user_id', execution.patient_id)
                    .single();
                  
                  const { data: contentAccessData, error: insertError } = await supabase
                    .from('content_access')
                    .insert({
                      execution_id: executionId,
                      patient_id: execution.patient_id,
                      access_token: accessToken,
                      files: arquivosNormalizados,
                      expires_at: expiresAt.toISOString(),
                      metadata: {
                        patient_name: patient?.name || 'Paciente',
                        flow_name: formEndNodeData.titulo || 'Formulário',
                        form_name: formEndNodeData.titulo || 'Formulário',
                        created_at: new Date().toISOString()
                      }
                    })
                    .select()
                    .single();
                  
                  if (insertError) {
                    console.error('❌ usePatientFlows: Erro ao criar content_access:', insertError);
                  } else {
                    console.log('✅ usePatientFlows: content_access criado:', contentAccessData);
                    
                    // Criar URL de conteúdo
                    const contentUrl = `${window.location.origin}/conteudo-formulario/${executionId}?token=${accessToken}`;
                    console.log('🔗 usePatientFlows: URL gerada:', contentUrl);
                    
                    // Enviar WhatsApp se o paciente tem telefone
                    if (patient?.phone) {
                      const message = `🎉 *Formulário Concluído!*

Olá ${patient.name}! Você concluiu o formulário com sucesso.

📁 *Seus materiais estão prontos:*
${contentUrl}

_Este link expira em 30 dias._`;

                      // Importar sendMessage do hook WhatsApp
                      const { useWhatsApp } = await import('./useWhatsApp');
                      
                      console.log('📱 usePatientFlows: Tentando enviar WhatsApp...', { phone: patient.phone, message });
                      
                      // Como é um hook, vamos usar fetch direto para o edge function send-whatsapp
                      try {
                        const response = await fetch(`https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/send-whatsapp`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabase.supabaseKey}`
                          },
                          body: JSON.stringify({
                            phone: patient.phone,
                            message: message
                          })
                        });
                        
                        if (response.ok) {
                          console.log('✅ usePatientFlows: WhatsApp enviado com sucesso');
                        } else {
                          console.error('❌ usePatientFlows: Erro no envio WhatsApp:', await response.text());
                        }
                      } catch (whatsappError) {
                        console.error('❌ usePatientFlows: Erro no WhatsApp:', whatsappError);
                      }
                    }
                  }
                } catch (formEndError) {
                  console.error('❌ usePatientFlows: Erro no processamento FormEnd:', formEndError);
                }
              } else {
                console.log('📝 usePatientFlows: Nenhum arquivo no FormEnd, só enviando notificação');
              }
              
              console.log('✅ usePatientFlows: Processamento FormEnd concluído');
            } else {
              console.warn('⚠️ usePatientFlows: Nó FormEnd não encontrado no flow');
            }
          }
        } catch (endError) {
          console.error('❌ usePatientFlows: Erro ao processar FormEnd:', endError);
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
