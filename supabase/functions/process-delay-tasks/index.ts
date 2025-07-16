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

    // Buscar tasks que precisam ser processadas (delay expirado)
    const { data: pendingTasks, error: tasksError } = await supabase
      .from('delay_tasks')
      .select('*')
      .eq('processed', false)
      .lte('trigger_at', new Date().toISOString());

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

          // Processar apenas se o próximo nó for FormStart
          if (task.next_node_type === 'formStart') {
            console.log(`📱 Enviando WhatsApp para FormStart na execução ${task.execution_id}`);
            
            // Chamar a edge function send-form-notification
            const { error: notificationError } = await supabase.functions.invoke('send-form-notification', {
              body: {
                patientId: task.patient_id,
                formName: task.form_name,
                executionId: task.execution_id
              }
            });

            if (notificationError) {
              console.error(`❌ Erro ao enviar notificação para task ${task.id}:`, notificationError);
              errorCount++;
              continue;
            }

            console.log(`✅ Notificação enviada com sucesso para task ${task.id}`);

            // Após enviar notificação com sucesso, avançar o flow para o próximo step
            console.log(`🔄 Avançando execução para o próximo step (FormStart)`);
            
            if (execution?.current_step) {
              const currentStep = execution.current_step;
              const currentStepIndex = currentStep.currentStepIndex || 0;
              
              // Marcar o step de delay atual como completed
              if (currentStep.steps && currentStep.steps[currentStepIndex]) {
                currentStep.steps[currentStepIndex].completed = true;
              }
              
              // Avançar para o próximo step (FormStart)
              const nextStepIndex = currentStepIndex + 1;
              currentStep.currentStepIndex = nextStepIndex;
              
              // 🔧 CORREÇÃO: Atualizar status para em-andamento e zerar progresso para novo FormStart
              await supabase
                .from('flow_executions')
                .update({
                  current_node: task.next_node_id,
                  current_step: currentStep,
                  status: 'in-progress', // Garantir que está em progresso
                  progress: 0, // Zerar progresso para novo formulário
                  updated_at: new Date().toISOString()
                })
                .eq('id', task.execution_id);
                
              console.log(`✅ Execução avançada para node ${task.next_node_id}, step index ${nextStepIndex}, status: in-progress, progress: 0`);
            }
          } else {
            console.log(`🔕 Próximo nó não é FormStart (${task.next_node_type}), apenas marcando como processado`);
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