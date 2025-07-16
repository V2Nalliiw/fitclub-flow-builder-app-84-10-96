import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

serve(async (req) => {
  console.log('⏰ cron-delay-processor: Processamento automático iniciado');

  try {
    // Inicializar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Chamar a função de processamento de delay tasks
    const { data, error } = await supabase.functions.invoke('process-delay-tasks', {
      body: {}
    });

    if (error) {
      console.error('❌ Erro ao processar delay tasks:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ cron-delay-processor: Processamento concluído:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cron job executado com sucesso',
      data 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no cron-delay-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});