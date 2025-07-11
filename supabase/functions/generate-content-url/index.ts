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

    // ✨ CORRIGIDO: Processamento robusto de arquivos com URLs normalizadas
    const processedFiles = [];
    
    for (const file of files) {
      try {
        console.log(`🔍 Processando arquivo: ${file.nome || 'sem nome'}`, file);
        
        // ✨ MELHORADO: Normalização robusta de URLs
        let publicUrl = file.url;
        let storagePath = '';
        
        // Limpar URLs duplicadas ou malformadas
        if (publicUrl && typeof publicUrl === 'string') {
          // Remover duplicações de https://
          if (publicUrl.includes('https://') && publicUrl.indexOf('https://') !== publicUrl.lastIndexOf('https://')) {
            const parts = publicUrl.split('https://');
            publicUrl = 'https://' + parts[parts.length - 1];
          }
          
          // Extrair caminho do storage
          if (publicUrl.includes('/storage/v1/object/public/flow-documents/')) {
            storagePath = publicUrl.split('/storage/v1/object/public/flow-documents/')[1];
          } else if (!publicUrl.startsWith('http')) {
            storagePath = publicUrl;
            publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${storagePath}`;
          }
        } else {
          // Se não há URL, usar o nome do arquivo
          storagePath = file.nome || 'documento.pdf';
          publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${storagePath}`;
        }
        
        console.log(`📁 URLs geradas - Pública: ${publicUrl}, Storage: ${storagePath}`);
        
        // Verificar se o arquivo existe no storage (com fallback)
        let fileExists = false;
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('flow-documents')
            .download(storagePath);
          
          fileExists = !fileError && fileData;
          if (fileError) {
            console.warn(`⚠️ Arquivo não encontrado em: ${storagePath}`, fileError.message);
          } else {
            console.log(`✅ Arquivo confirmado no storage: ${storagePath}`);
          }
        } catch (storageError) {
          console.warn(`⚠️ Erro ao verificar arquivo no storage:`, storageError);
        }
        
        const processedFile = {
          id: file.id || crypto.randomUUID(),
          nome: file.nome || 'documento.pdf',
          url: publicUrl,
          tipo: file.tipo || 'application/pdf',
          tamanho: file.tamanho || 0,
          downloadUrl: `${req.url.split('/functions/')[0]}/functions/v1/serve-content/${accessToken}/${encodeURIComponent(file.nome || 'documento.pdf')}`,
          exists: fileExists,
          storagePath: storagePath
        };
        
        processedFiles.push(processedFile);
        console.log(`✅ Arquivo processado: ${file.nome} -> ${publicUrl} (existe: ${fileExists})`);
      } catch (error) {
        console.error(`❌ Erro ao processar arquivo ${file.nome}:`, error);
        
        // ✨ FALLBACK: Adicionar arquivo mesmo com erro para não perder
        const fallbackFile = {
          id: file.id || crypto.randomUUID(),
          nome: file.nome || 'documento.pdf',
          url: file.url || `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${file.nome}`,
          tipo: file.tipo || 'application/pdf',
          tamanho: file.tamanho || 0,
          downloadUrl: `${req.url.split('/functions/')[0]}/functions/v1/serve-content/${accessToken}/${encodeURIComponent(file.nome || 'documento.pdf')}`,
          exists: false,
          error: error.message
        };
        
        processedFiles.push(fallbackFile);
      }
    }

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