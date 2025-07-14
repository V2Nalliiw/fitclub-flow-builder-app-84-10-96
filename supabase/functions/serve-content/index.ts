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
    const pathParts = url.pathname.split('/');
    
    // Expected format: /functions/v1/serve-content/{token}/{filename}
    const token = pathParts[pathParts.length - 2];
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (!token || !filename) {
      return new Response('Token e nome do arquivo são obrigatórios', {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log('Serving content:', { token, filename });

    // Buscar dados do content_access
    const { data: contentAccess, error: accessError } = await supabase
      .from('content_access')
      .select('*')
      .eq('access_token', token)
      .single();

    if (accessError || !contentAccess) {
      console.error('Content access not found:', accessError);
      return new Response('Acesso não autorizado ou expirado', {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Verificar se não expirou
    const now = new Date();
    const expiresAt = new Date(contentAccess.expires_at);
    if (now > expiresAt) {
      return new Response('Acesso expirado', {
        status: 403,
        headers: corsHeaders,
      });
    }

    // Encontrar o arquivo nos dados
    const files = contentAccess.files as any[];
    const requestedFile = files.find(f => f.nome === filename);

    if (!requestedFile) {
      return new Response('Arquivo não encontrado', {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log('Found file:', requestedFile);

    // ✨ MELHORADO: Estratégia robusta de URLs com fallbacks inteligentes
    let possibleUrls = [];
    
    // Construir URLs possíveis baseadas nas informações disponíveis
    if (requestedFile.url) {
      possibleUrls.push(requestedFile.url);
      
      // Se a URL tem duplicação, corrigir
      if (requestedFile.url.includes('https://') && requestedFile.url.indexOf('https://') !== requestedFile.url.lastIndexOf('https://')) {
        const parts = requestedFile.url.split('https://');
        const cleanUrl = 'https://' + parts[parts.length - 1];
        possibleUrls.push(cleanUrl);
      }
    }
    
    // ✨ MELHORADO: URLs alternativas para ambos os buckets
    // Priorizar clinic-materials (bucket principal)
    possibleUrls.push(
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/clinic-materials/${filename}`,
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/clinic-materials/${requestedFile.storagePath || filename}`,
      // Fallback para flow-documents (compatibilidade)
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${filename}`,
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${requestedFile.storagePath || filename}`,
      // Tentar com o filename original do arquivo também
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/clinic-materials/${requestedFile.original_filename || filename}`,
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${requestedFile.original_filename || filename}`
    );
    
    // Se há informação de storage path no arquivo, adicionar para ambos buckets
    if (requestedFile.storagePath) {
      possibleUrls.push(
        `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/clinic-materials/${requestedFile.storagePath}`,
        `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flow-documents/${requestedFile.storagePath}`
      );
    }
    
    // Remover URLs duplicadas
    possibleUrls = [...new Set(possibleUrls.filter(url => url && url.trim()))];
    
    console.log('📋 URLs possíveis para tentativa:', possibleUrls);

    for (let i = 0; i < possibleUrls.length; i++) {
      const fileUrl = possibleUrls[i];
      try {
        console.log(`🔍 Tentando URL ${i + 1}/${possibleUrls.length}:`, fileUrl);
        const fileResponse = await fetch(fileUrl);
        
        if (fileResponse.ok) {
          console.log('✅ Arquivo servido com sucesso de:', fileUrl);
          
          // Repassar o arquivo com headers apropriados
          const contentType = requestedFile.tipo || 'application/octet-stream';
          const fileBuffer = await fileResponse.arrayBuffer();
          
          console.log(`📁 Arquivo baixado: ${fileBuffer.byteLength} bytes, tipo: ${contentType}`);
          
          return new Response(fileBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': fileBuffer.byteLength.toString(),
              'Cache-Control': 'public, max-age=3600',
            },
          });
        } else {
          console.warn(`⚠️ URL ${i + 1} falhou com status ${fileResponse.status}:`, fileUrl);
        }
      } catch (error) {
        console.error(`❌ Erro na URL ${i + 1}:`, fileUrl, error.message);
      }
    }

    // Se não conseguiu baixar de nenhuma URL
    return new Response('Arquivo não disponível no momento', {
      status: 500,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in serve-content:', error);
    return new Response('Erro interno do servidor', {
      status: 500,
      headers: corsHeaders,
    });
  }
});