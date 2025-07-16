import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 test-delay-task function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Criar delay task de teste que expira em 1 minuto
    const triggerAt = new Date(Date.now() + 60000); // 1 minuto a partir de agora
    
    const { data: delayTask, error: delayError } = await supabase
      .from('delay_tasks')
      .insert({
        execution_id: '51ff760a-b752-47f8-b425-7bdacb5a271d',
        patient_id: '4cb7241b-9f2e-4473-a5c7-04df5b5064b2',
        next_node_id: 'test-node-' + Date.now(),
        next_node_type: 'formStart',
        form_name: 'Teste Template WhatsApp',
        trigger_at: triggerAt.toISOString(),
        processed: false
      })
      .select()
      .single();

    if (delayError) {
      throw new Error(`Erro ao criar delay task: ${delayError.message}`);
    }

    console.log('✅ Delay task de teste criada:', delayTask);

    return new Response(JSON.stringify({
      success: true,
      message: 'Delay task de teste criada com sucesso',
      delayTask,
      triggerAt: triggerAt.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função test-delay-task:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});