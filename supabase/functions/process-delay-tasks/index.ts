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

    // Gerar ID único para esta instância de processamento
    const processingInstanceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Processing Instance ID:', processingInstanceId);

    // Buscar tasks que precisam ser processadas (delay expirado)
    const currentTime = new Date().toISOString();
    console.log('⏰ Hora atual para comparação:', currentTime);
    
    if (forcedExecution) {
      console.log('🔥 EXECUÇÃO FORÇADA: Processando todas as tasks pendentes independente do horário');
    }
    
    // Buscar tasks não processadas e aplicar lock otimista
    let query = supabase
      .from('delay_tasks')
      .select('*')
      .eq('processed', false)
      .is('processing_started_at', null); // Apenas tasks não sendo processadas

    if (!forcedExecution) {
      query = query.lte('trigger_at', currentTime);
    }

    const { data: availableTasks, error: tasksError } = await query;

    if (tasksError) {
      throw new Error(`Erro ao buscar tasks: ${tasksError.message}`);
    }

    console.log(`📋 Encontradas ${availableTasks?.length || 0} tasks disponíveis para processar`);

    let processedCount = 0;
    let errorCount = 0;
    let lockedTasks: any[] = [];

    // Aplicar lock otimista nas tasks encontradas
    if (availableTasks && availableTasks.length > 0) {
      for (const task of availableTasks) {
        const { data: lockedTask, error: lockError } = await supabase
          .from('delay_tasks')
          .update({
            processing_started_at: currentTime,
            processing_instance_id: processingInstanceId
          })
          .eq('id', task.id)
          .eq('processed', false)
          .is('processing_started_at', null) // Verificar se ainda não foi bloqueada
          .select('*')
          .single();

        if (!lockError && lockedTask) {
          lockedTasks.push(lockedTask);
          console.log(`🔒 Task ${task.id} bloqueada para processamento`);
        } else {
          console.log(`⚠️ Task ${task.id} já foi bloqueada por outra instância`);
        }
      }
    }

    console.log(`🔒 ${lockedTasks.length} tasks bloqueadas com sucesso para processamento`);

    if (lockedTasks.length > 0) {
      for (const task of lockedTasks) {
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
              console.log(`🚀 INVOKING send-form-notification para task ${task.id}...`);
              console.log(`📋 Parâmetros da invocação:`, {
                patientId: task.patient_id,
                formName: task.form_name,
                executionId: task.execution_id
              });
              
              // Chamar a edge function send-form-notification
              const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-form-notification', {
                body: {
                  patientId: task.patient_id,
                  formName: task.form_name,
                  executionId: task.execution_id
                }
              });

              if (notificationError) {
                console.error(`❌ CRÍTICO: Erro ao invocar send-form-notification para task ${task.id}:`, {
                  error: notificationError,
                  details: notificationError.message || 'Unknown error',
                  context: notificationError.context
                });
                errorCount++;
                continue;
              }

              console.log(`✅ SUCESSO: send-form-notification invocada para task ${task.id}`, {
                result: notificationResult,
                success: notificationResult?.success,
                patientName: notificationResult?.patientName,
                formName: notificationResult?.formName
              });

              // CRÍTICO: Após enviar notificação, atualizar execução corretamente
              console.log(`🔄 Posicionando execução NO FormStart (não além dele)`);
              
              if (execution?.current_step) {
                const currentStep = execution.current_step;
                const currentStepIndex = currentStep.currentStepIndex || 0;
                const currentSteps = currentStep.steps || [];
                
                console.log(`📊 Estado atual: stepIndex=${currentStepIndex}, totalSteps=${currentSteps.length}`);
                
                // Marcar o step de delay atual como completed
                if (currentStep.steps && currentStep.steps[currentStepIndex]) {
                  currentStep.steps[currentStepIndex].completed = true;
                  currentStep.steps[currentStepIndex].completedAt = new Date().toISOString();
                  console.log(`✅ Step ${currentStepIndex} (delay) marcado como concluído`);
                }
                
                // Avançar para o próximo step (FormStart) - mas deixá-lo como incompleto
                const nextStepIndex = currentStepIndex + 1;
                currentStep.currentStepIndex = nextStepIndex;
                
                // CRÍTICO: Não marcar o FormStart como completed! Ele deve aparecer como disponível
                if (currentStep.steps && currentStep.steps[nextStepIndex]) {
                  currentStep.steps[nextStepIndex].completed = false; // Formstart deve estar incompleto
                  currentStep.steps[nextStepIndex].availableAt = new Date().toISOString();
                  delete currentStep.steps[nextStepIndex].completedAt; // Remover completedAt se existir
                  console.log(`📱 FormStart (step ${nextStepIndex}) disponibilizado para o paciente`);
                }
                
                // Verificar se há mais steps após o FormStart
                const hasMoreSteps = nextStepIndex < currentSteps.length - 1;
                console.log(`📊 FormStart posicionado no index ${nextStepIndex}, hasMoreSteps=${hasMoreSteps}`);
                
                // CRÍTICO: Definir current_node como o FormStart e status como in-progress
                const updateData: any = {
                  current_node: task.next_node_id, // O FormStart node
                  current_step: currentStep,
                  status: 'in-progress', // Em progresso aguardando interação do paciente
                  next_step_available_at: null, // Sem delay - disponível imediatamente
                  updated_at: new Date().toISOString(),
                  completed_steps: currentStepIndex + 1 // Contar apenas os steps realmente completados
                };
                
                console.log(`📝 Atualizando execução para mostrar FormStart:`, {
                  status: updateData.status,
                  currentNode: updateData.current_node,
                  stepIndex: nextStepIndex,
                  formStartCompleted: false,
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
                console.log(`✅ FormStart (${task.next_node_id}) disponibilizado no step ${nextStepIndex}, status=${updateData.status}`);
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
      totalTasks: lockedTasks.length,
      availableTasks: availableTasks?.length || 0,
      processingInstanceId
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