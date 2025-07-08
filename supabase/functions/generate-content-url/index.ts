import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { executionId, files } = await req.json();

    if (!executionId || !files || !Array.isArray(files)) {
      return new Response(
        JSON.stringify({ error: 'executionId e files são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Gerando URL de conteúdo para execução:', executionId);
    console.log('Arquivos:', files.length);

    // Buscar dados da execução
    const { data: execution, error: executionError } = await supabase
      .from('flow_executions')
      .select('patient_id, flow_id')
      .eq('id', executionId)
      .single();

    if (executionError || !execution) {
      console.error('Erro ao buscar execução:', executionError);
      return new Response(
        JSON.stringify({ error: 'Execução não encontrada' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar dados do paciente para personalização
    const { data: patient } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', execution.patient_id)
      .single();

    // Gerar token único para acesso seguro
    const accessToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias

    // Criar entrada na tabela de conteúdos (vamos criar essa tabela)
    const contentData = {
      id: crypto.randomUUID(),
      execution_id: executionId,
      patient_id: execution.patient_id,
      access_token: accessToken,
      files: files,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      metadata: {
        patient_name: patient?.name || 'Paciente',
        flow_id: execution.flow_id
      }
    };

    // Para agora, vamos salvar no campo current_step da execução
    const { error: updateError } = await supabase
      .from('flow_executions')
      .update({
        current_step: {
          ...execution,
          content_access: {
            token: accessToken,
            files: files,
            expires_at: expiresAt.toISOString(),
            url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/serve-content?token=${accessToken}`
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId);

    if (updateError) {
      console.error('Erro ao salvar dados de acesso:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar URL de acesso' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // URL pública que será enviada via WhatsApp
    const publicUrl = `${req.url.split('/functions/')[0]}/conteudo-formulario/${executionId}?token=${accessToken}`;
    
    console.log('URL pública gerada:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        token: accessToken,
        expires_at: expiresAt.toISOString(),
        files_count: files.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na function generate-content-url:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});