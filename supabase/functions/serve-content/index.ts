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

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extrair token do path: /serve-content/{token} ou /serve-content/{token}/{filename}
    const token = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];
    const filename = pathParts.length > 2 ? decodeURIComponent(pathParts[pathParts.length - 1]) : null;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token de acesso requerido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Serving content for token:', token, 'filename:', filename);

    // Buscar dados do content_access
    const { data: contentAccess, error } = await supabase
      .from('content_access')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !contentAccess) {
      console.error('Content access not found:', error);
      return new Response(
        JSON.stringify({ error: 'Conteúdo não encontrado ou expirado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar se o token não expirou
    const now = new Date();
    const expiresAt = new Date(contentAccess.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Link expirado' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Se filename específico foi solicitado, servir apenas esse arquivo
    if (filename) {
      const files = contentAccess.files as any[];
      const file = files.find((f: any) => f.nome === filename);
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'Arquivo não encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Fazer download do arquivo do Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('flow-documents')
        .download(file.url.replace(/.*\/flow-documents\//, ''));

      if (fileError || !fileData) {
        console.error('Error downloading file:', fileError);
        return new Response(
          JSON.stringify({ error: 'Erro ao baixar arquivo' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Retornar o arquivo com headers apropriados
      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': file.tipo || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.nome}"`,
          'Content-Length': file.tamanho?.toString() || '',
        },
      });
    }

    // Se não foi solicitado arquivo específico, retornar página de conteúdo
    const publicUrl = `${req.url.split('/functions/')[0]}/conteudo-formulario/${contentAccess.execution_id}?token=${token}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        execution_id: contentAccess.execution_id,
        patient_id: contentAccess.patient_id,
        files: contentAccess.files,
        metadata: contentAccess.metadata,
        expires_at: contentAccess.expires_at,
        redirect_url: publicUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na function serve-content:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});