import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔗 generate-secure-download-link function called - NOVA ESTRATÉGIA STORAGE');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { patientId, executionId, files } = await req.json();
    console.log('📨 Request data:', { patientId, executionId, filesCount: files?.length });

    if (!patientId || !executionId || !files || files.length === 0) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔄 Gerando Signed URLs para WhatsApp...');
    
    // Gerar signed URLs para cada arquivo usando Supabase Storage
    const signedUrls = [];
    
    for (const file of files) {
      console.log('📁 Processando arquivo:', file.filename);
      
      try {
        // Gerar signed URL com 24 horas de expiração
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('clinic-materials')
          .createSignedUrl(file.path, 86400); // 24 horas em segundos
        
        if (signedError) {
          console.error('❌ Erro ao gerar signed URL para', file.filename, ':', signedError);
          continue;
        }
        
        signedUrls.push({
          filename: file.filename,
          signedUrl: signedUrlData.signedUrl,
          originalPath: file.path
        });
        
        console.log('✅ Signed URL gerada para:', file.filename);
        
      } catch (fileError) {
        console.error('❌ Erro ao processar arquivo', file.filename, ':', fileError);
        continue;
      }
    }
    
    if (signedUrls.length === 0) {
      console.error('❌ Nenhuma URL válida foi gerada');
      return new Response(
        JSON.stringify({ error: 'Falha ao gerar URLs de download' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Salvar as URLs geradas para rastreamento
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: contentAccess, error: contentError } = await supabase
      .from('content_access')
      .insert({
        execution_id: executionId,
        patient_id: patientId,
        files: signedUrls,
        expires_at: expiresAt.toISOString(),
        metadata: {
          download_type: 'whatsapp_signed_urls',
          urls_generated: signedUrls.length,
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })
      .select()
      .single();

    if (contentError) {
      console.error('❌ Erro ao salvar content access:', contentError);
    }

    console.log(`✅ ${signedUrls.length} Signed URLs geradas com sucesso`);

    // Retornar a primeira URL (para um arquivo) ou uma lista (para múltiplos)
    const primaryUrl = signedUrls[0].signedUrl;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        primaryDownloadUrl: primaryUrl,
        allUrls: signedUrls,
        urlsCount: signedUrls.length,
        expiresAt: expiresAt.toISOString(),
        accessId: contentAccess?.id || 'no-tracking'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-secure-download-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});