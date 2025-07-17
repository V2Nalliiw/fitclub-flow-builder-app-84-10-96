import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 process-delay-tasks function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Receber parâmetros do body (para execução forçada)
    const body = await req.json().catch(() => ({}));
    const { forcedExecution = false } = body;

    // Buscar tasks que precisam ser processadas (delay expirado)
    const currentTime = new Date().toISOString();
    console.log('⏰ Hora atual para comparação:', currentTime);
    
    if (forcedExecution) {
      console.log('🔥 EXECUÇÃO FORÇADA: Processando todas as tasks pendentes independente do horário');
    }
    
    // Buscar tasks com base no modo de execução
    let query = supabase
      .from('delay_tasks')
      .select('*')
      .eq('processed', false);

    if (!forcedExecution) {
      query = query.lte('trigger_at', currentTime);
    }

    const { data: pendingTasks, error: tasksError } = await query;

    if (tasksError) {
      throw new Error(`Erro ao buscar tasks: ${tasksError.message}`);
    }

    console.log(`📋 Encontradas ${pendingTasks?.length || 0} tasks para processar`);

    let processedCount = 0;
    let errorCount = 0;

    if (pendingTasks && pendingTasks.length > 0) {
      for (const task of pendingTasks) {
        try {
          // Verificar se a execução ainda está ativa e buscar dados completos
          const { data: execution } = await supabase
            .from('flow_executions')
            .select('*')
            .eq('id', task.execution_id)
            .single();
          
          if (execution?.status === 'completed') {
            console.log(`⚠️ Execução ${task.execution_id} já finalizada, marcando task como processada`);
            await supabase
              .from('delay_tasks')
              .update({ processed: true, processed_at: new Date().toISOString() })
              .eq('id', task.id);
            continue;
          }

          // Processar tasks de delay - CRÍTICO para WhatsApp
          console.log(`📱 Processando delay task para ${task.next_node_type} na execução ${task.execution_id}`);
          console.log(`📋 Task details:`, {
            id: task.id,
            patientId: task.patient_id,
            nextNodeType: task.next_node_type,
            formName: task.form_name,
            triggerAt: task.trigger_at,
            createdAt: task.created_at
          });
          
          if (task.next_node_type === 'formStart') {
            console.log(`📱 CRÍTICO: Enviando WhatsApp para FormStart na execução ${task.execution_id}`);
            
            try {
              // Chamar a edge function send-form-notification
              const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-form-notification', {
                body: {
                  patientId: task.patient_id,
                  formName: task.form_name,
                  executionId: task.execution_id
                }
              });

              if (notificationError) {
                console.error(`❌ CRÍTICO: Erro ao enviar notificação para task ${task.id}:`, notificationError);
                errorCount++;
                continue;
              }

              console.log(`✅ SUCESSO: Notificação WhatsApp enviada para task ${task.id}`, notificationResult);

              // CRÍTICO: Após enviar notificação, atualizar execução corretamente
              console.log(`🔄 Avançando execução para o próximo step (FormStart)`);
              
              if (execution?.current_step) {
                const currentStep = execution.current_step;
                const currentStepIndex = currentStep.currentStepIndex || 0;
                const currentSteps = currentStep.steps || [];
                
                console.log(`📊 Estado atual: stepIndex=${currentStepIndex}, totalSteps=${currentSteps.length}`);
                
                // Marcar o step de delay atual como completed
                if (currentStep.steps && currentStep.steps[currentStepIndex]) {
                  currentStep.steps[currentStepIndex].completed = true;
                  currentStep.steps[currentStepIndex].completedAt = new Date().toISOString();
                  console.log(`✅ Step ${currentStepIndex} marcado como concluído`);
                }
                
                // Avançar para o próximo step (FormStart)
                const nextStepIndex = currentStepIndex + 1;
                currentStep.currentStepIndex = nextStepIndex;
                
                // Verificar se há mais steps após este
                const hasMoreSteps = nextStepIndex < currentSteps.length - 1;
                console.log(`📊 Próximo step: index=${nextStepIndex}, hasMoreSteps=${hasMoreSteps}`);
                
                // CRÍTICO: Sempre definir como 'in-progress' se há steps disponíveis
                const updateData: any = {
                  current_node: task.next_node_id,
                  current_step: currentStep,
                  status: 'in-progress', // SEMPRE in-progress para steps disponíveis
                  next_step_available_at: null, // CRÍTICO: Limpar delay
                  updated_at: new Date().toISOString(),
                  completed_steps: nextStepIndex // Atualizar progresso
                };
                
                // Se não há mais steps, marcar como completado
                if (!hasMoreSteps) {
                  updateData.status = 'completed';
                  updateData.completed_at = new Date().toISOString();
                  updateData.current_node = null;
                  console.log(`🏁 Execução será marcada como concluída`);
                }
                
                console.log(`📝 Atualizando execução com:`, {
                  status: updateData.status,
                  currentNode: updateData.current_node,
                  stepIndex: nextStepIndex,
                  hasMoreSteps,
                  nextStepAvailableAt: updateData.next_step_available_at
                });
                
                const { data: updateResult, error: updateError } = await supabase
                  .from('flow_executions')
                  .update(updateData)
                  .eq('id', task.execution_id)
                  .select('status, next_step_available_at, completed_steps');
                
                if (updateError) {
                  console.error(`❌ CRÍTICO: Erro ao atualizar execução ${task.execution_id}:`, updateError);
                  throw new Error(`Erro ao atualizar execução: ${updateError.message}`);
                }
                
                console.log(`✅ Execução atualizada com sucesso:`, updateResult);
                console.log(`✅ Execução avançada para node ${task.next_node_id}, stepIndex=${nextStepIndex}, status=${updateData.status}, hasMoreSteps=${hasMoreSteps}`);
              }
              
            } catch (sendError) {
              console.error(`❌ CRÍTICO: Erro ao processar envio para task ${task.id}:`, sendError);
              errorCount++;
              continue;
            }
            
          } else {
            console.log(`🔕 Próximo nó não é FormStart (${task.next_node_type}), processando outros tipos...`);
            
            // Para outros tipos de nó, avançar a execução sem enviar WhatsApp
            if (execution?.current_step) {
              const currentStep = execution.current_step;
              const currentStepIndex = currentStep.currentStepIndex || 0;
              const currentSteps = currentStep.steps || [];
              
              console.log(`📊 Processando nó ${task.next_node_type}: stepIndex=${currentStepIndex}, totalSteps=${currentSteps.length}`);
              
              // Marcar o step de delay atual como completed
              if (currentStep.steps && currentStep.steps[currentStepIndex]) {
                currentStep.steps[currentStepIndex].completed = true;
                currentStep.steps[currentStepIndex].completedAt = new Date().toISOString();
                console.log(`✅ Step ${currentStepIndex} marcado como concluído`);
              }
              
              // Avançar para o próximo step
              const nextStepIndex = currentStepIndex + 1;
              currentStep.currentStepIndex = nextStepIndex;
              
              // Verificar se há mais steps após este
              const hasMoreSteps = nextStepIndex < currentSteps.length - 1;
              console.log(`📊 Próximo step: index=${nextStepIndex}, hasMoreSteps=${hasMoreSteps}`);
              
              // CRÍTICO: Sempre definir como 'in-progress' se há steps disponíveis
              const updateData: any = {
                current_node: task.next_node_id,
                current_step: currentStep,
                status: 'in-progress', // SEMPRE in-progress para steps disponíveis
                next_step_available_at: null, // CRÍTICO: Limpar delay
                updated_at: new Date().toISOString(),
                completed_steps: nextStepIndex // Atualizar progresso
              };
              
              // Se não há mais steps, marcar como completado
              if (!hasMoreSteps) {
                updateData.status = 'completed';
                updateData.completed_at = new Date().toISOString();
                updateData.current_node = null;
                console.log(`🏁 Execução será marcada como concluída`);
              }
              
              console.log(`📝 Atualizando execução com:`, {
                status: updateData.status,
                currentNode: updateData.current_node,
                stepIndex: nextStepIndex,
                hasMoreSteps,
                nextStepAvailableAt: updateData.next_step_available_at
              });
              
              const { data: updateResult, error: updateError } = await supabase
                .from('flow_executions')
                .update(updateData)
                .eq('id', task.execution_id)
                .select('status, next_step_available_at, completed_steps');
              
              if (updateError) {
                console.error(`❌ CRÍTICO: Erro ao atualizar execução ${task.execution_id}:`, updateError);
                throw new Error(`Erro ao atualizar execução: ${updateError.message}`);
              }
              
              console.log(`✅ Execução atualizada com sucesso:`, updateResult);
              console.log(`✅ Execução atualizada: node=${task.next_node_id} (tipo: ${task.next_node_type}), stepIndex=${nextStepIndex}, status=${updateData.status}, hasMoreSteps=${hasMoreSteps}`);
            }
          }

          // Marcar task como processada
          await supabase
            .from('delay_tasks')
            .update({ 
              processed: true, 
              processed_at: new Date().toISOString() 
            })
            .eq('id', task.id);

          processedCount++;

        } catch (taskError) {
          console.error(`❌ Erro ao processar task ${task.id}:`, taskError);
          errorCount++;
        }
      }
    }

    console.log(`✅ Processamento concluído: ${processedCount} tasks processadas, ${errorCount} erros`);

    return new Response(JSON.stringify({ 
      success: true, 
      processedCount,
      errorCount,
      totalTasks: pendingTasks?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função process-delay-tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});