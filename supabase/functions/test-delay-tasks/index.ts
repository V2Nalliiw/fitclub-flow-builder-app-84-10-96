import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 test-delay-tasks: Função de teste iniciada');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action = 'status', executionId, delayMinutes = 1 } = body;

    console.log(`🧪 Ação solicitada: ${action}`, { executionId, delayMinutes });

    if (action === 'status') {
      // Verificar status de delay tasks
      const { data: pendingTasks, error: pendingError } = await supabase
        .from('delay_tasks')
        .select('*')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: recentTasks, error: recentError } = await supabase
        .from('delay_tasks')
        .select('*')
        .eq('processed', true)
        .order('processed_at', { ascending: false })
        .limit(10);

      if (pendingError || recentError) {
        throw new Error(`Erro ao buscar tasks: ${pendingError?.message || recentError?.message}`);
      }

      console.log(`📊 Status: ${pendingTasks?.length || 0} pending, ${recentTasks?.length || 0} recent processed`);

      return new Response(JSON.stringify({
        success: true,
        pendingTasks: pendingTasks || [],
        recentTasks: recentTasks || [],
        totalPending: pendingTasks?.length || 0,
        totalRecent: recentTasks?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'create-test') {
      // Criar uma delay task de teste
      if (!executionId) {
        throw new Error('executionId é obrigatório para criar delay task de teste');
      }

      const triggerAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
      
      const { data: newTask, error: insertError } = await supabase
        .from('delay_tasks')
        .insert({
          execution_id: executionId,
          patient_id: '00000000-0000-0000-0000-000000000000', // Test UUID
          next_node_id: 'test-form-node',
          next_node_type: 'formStart',
          form_name: 'Test Form',
          trigger_at: triggerAt,
          processed: false
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar delay task: ${insertError.message}`);
      }

      console.log(`✅ Delay task de teste criada:`, newTask);

      return new Response(JSON.stringify({
        success: true,
        message: `Delay task de teste criada para ${delayMinutes} minuto(s)`,
        task: newTask,
        triggerAt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'force-process') {
      // Forçar processamento de delay tasks específicas ou todas pendentes
      const currentTime = new Date().toISOString();
      
      let query = supabase
        .from('delay_tasks')
        .select('*')
        .eq('processed', false);

      if (executionId) {
        query = query.eq('execution_id', executionId);
      }

      const { data: tasksToProcess, error: queryError } = await query;

      if (queryError) {
        throw new Error(`Erro ao buscar tasks: ${queryError.message}`);
      }

      console.log(`🔄 Forçando processamento de ${tasksToProcess?.length || 0} tasks`);

      // Chamar a função process-delay-tasks diretamente
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-delay-tasks', {
        body: { forcedExecution: true, currentTime }
      });

      if (processError) {
        console.error('❌ Erro ao processar tasks:', processError);
        throw new Error(`Erro ao processar tasks: ${processError.message}`);
      }

      console.log('✅ Processamento forçado concluído:', processResult);

      return new Response(JSON.stringify({
        success: true,
        message: `Processamento forçado executado`,
        tasksFound: tasksToProcess?.length || 0,
        processResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'test-whatsapp') {
      // Testar configurações do WhatsApp
      const { data: whatsappSettings, error: settingsError } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (settingsError) {
        console.log('⚠️ Nenhuma configuração ativa de WhatsApp encontrada');
        return new Response(JSON.stringify({
          success: false,
          message: 'Nenhuma configuração ativa de WhatsApp encontrada',
          error: settingsError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`📱 Configuração WhatsApp encontrada: ${whatsappSettings.provider}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'Configuração WhatsApp ativa encontrada',
        provider: whatsappSettings.provider,
        hasPhoneNumber: !!whatsappSettings.phone_number,
        hasApiKey: !!whatsappSettings.api_key,
        hasAccessToken: !!whatsappSettings.access_token
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error(`Ação não reconhecida: ${action}`);

  } catch (error) {
    console.error('❌ Erro na função test-delay-tasks:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});