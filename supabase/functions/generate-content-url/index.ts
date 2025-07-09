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

    // Processar arquivos para gerar URLs públicas corretas
    const processedFiles = files.map((file: any) => ({
      ...file,
      url: file.url.startsWith('http') ? file.url : `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${file.url}`,
      downloadUrl: `${req.url.split('/functions/')[0]}/functions/v1/serve-content/${accessToken}/${encodeURIComponent(file.nome)}`
    }));

    // Criar entrada na tabela content_access
    const { error: insertError } = await supabase
      .from('content_access')
      .insert({
        execution_id: executionId,
        patient_id: execution.patient_id,
        access_token: accessToken,
        files: processedFiles,
        expires_at: expiresAt.toISOString(),
        metadata: {
          patient_name: patient?.name || 'Paciente',
          flow_id: execution.flow_id,
          flow_name: execution.flow_name || 'Fluxo'
        }
      });

    if (insertError) {
      console.error('Erro ao criar entrada de acesso:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar acesso ao conteúdo' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Atualizar execução com referência ao content_access
    const { error: updateError } = await supabase
      .from('flow_executions')
      .update({
        current_step: {
          ...execution.current_step,
          content_access_token: accessToken,
          files_count: processedFiles.length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId);

    if (updateError) {
      console.error('Erro ao atualizar execução:', updateError);
      // Não retornar erro aqui pois o content_access já foi criado
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