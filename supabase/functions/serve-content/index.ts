import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log('🚀 serve-content function called');
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Verificar se é uma requisição de download direto
    const isDownload = pathParts.includes('download');
    
    if (isDownload) {
      // Rota: /serve-content/download/{token}/{filename}
      const token = pathParts[pathParts.length - 2];
      const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
      
      console.log('📥 Download direto solicitado:', { token, filename });
      
      if (!token || !filename) {
        return new Response('Token ou nome do arquivo não fornecido', { 
          status: 400,
          headers: corsHeaders
        });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get content access
      const { data: contentAccess, error } = await supabase
        .from('content_access')
        .select('*')
        .eq('access_token', token)
        .single();

      if (error || !contentAccess) {
        console.error('❌ Content access not found:', error);
        return new Response('Token inválido ou expirado', { 
          status: 404,
          headers: corsHeaders
        });
      }

      // Check if token is expired
      if (new Date() > new Date(contentAccess.expires_at)) {
        return new Response('Token expirado', { 
          status: 410,
          headers: corsHeaders
        });
      }

      // Encontrar o arquivo específico
      const files = contentAccess.files as any[];
      const file = files.find(f => f.nome === filename || f.original_filename === filename || f.filename === filename);
      
      if (!file) {
        console.error('❌ Arquivo não encontrado:', filename);
        return new Response('Arquivo não encontrado', { 
          status: 404,
          headers: corsHeaders
        });
      }

      console.log('📁 Arquivo encontrado:', file);

      try {
        console.log('📁 Tentando download do storage - arquivo:', file);
        
        // Extrair o caminho real do arquivo do URL
        let filePath = file.url;
        
        // Se for uma URL completa, extrair apenas o caminho do arquivo
        if (filePath.includes('/storage/v1/object/public/')) {
          const parts = filePath.split('/storage/v1/object/public/');
          if (parts.length > 1) {
            const pathPart = parts[1];
            // Remover o nome do bucket do início
            const bucketlessPath = pathPart.split('/').slice(1).join('/');
            filePath = bucketlessPath || pathPart;
          }
        } else if (filePath.includes('clinic-materials/') || filePath.includes('flow-documents/')) {
          // Já é um caminho relativo
          filePath = filePath.split('/').pop() || filename;
        } else {
          // Usar o nome do arquivo como fallback
          filePath = filename;
        }
        
        console.log('📁 Caminho do arquivo extraído:', filePath);

        // Usar apenas clinic-materials (bucket unificado)
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('clinic-materials')
          .download(filePath);

        if (downloadError) {
          console.error('❌ Erro ao baixar arquivo:', downloadError);
          
          // FALLBACK: Redirect para URL original se disponível
          if (file.url && file.url.startsWith('http')) {
            console.log('🔄 Fazendo redirect para URL original...');
            return new Response(null, {
              status: 302,
              headers: {
                ...corsHeaders,
                'Location': file.url,
              },
            });
          }
          
          return new Response('Arquivo não encontrado no storage', { 
            status: 404,
            headers: corsHeaders
          });
        }

        console.log('✅ Arquivo encontrado no clinic-materials');
        return new Response(fileData, {
          headers: {
            ...corsHeaders,
            'Content-Type': file.tipo || file.file_type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileData.size.toString(),
          },
        });

      } catch (storageError) {
        console.error('❌ Erro crítico no storage:', storageError);
        
        // FALLBACK FINAL: Redirect para URL original se disponível
        if (file.url && file.url.startsWith('http')) {
          console.log('🔄 Fallback: Redirect para URL original...');
          return new Response(null, {
            status: 302,
            headers: {
              ...corsHeaders,
              'Location': file.url,
            },
          });
        }
        
        return new Response('Erro interno do servidor', {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Rota padrão: exibir página HTML
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Token não fornecido', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get content access
    const { data: contentAccess, error } = await supabase
      .from('content_access')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !contentAccess) {
      console.error('❌ Content access not found:', error);
      return new Response('Token inválido ou expirado', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Check if token is expired
    if (new Date() > new Date(contentAccess.expires_at)) {
      return new Response('Token expirado', { 
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    console.log('✅ Content access found:', contentAccess.id);

    // Get patient info
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', contentAccess.patient_id)
      .single();

    const files = contentAccess.files as any[];
    
    // Generate HTML page with download links
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seus Materiais - Download</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #2563eb;
                text-align: center;
                margin-bottom: 10px;
            }
            .welcome {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
            }
            .file-list {
                margin: 20px 0;
            }
            .file-item {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .file-info {
                flex: 1;
            }
            .file-name {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 4px;
            }
            .file-desc {
                color: #64748b;
                font-size: 14px;
            }
            .download-btn {
                background: #2563eb;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            .download-btn:hover {
                background: #1d4ed8;
            }
            .expires {
                text-align: center;
                color: #ef4444;
                font-size: 14px;
                margin-top: 20px;
                padding: 10px;
                background: #fef2f2;
                border-radius: 6px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📁 Seus Materiais</h1>
            <div class="welcome">
                Olá ${profile?.name || 'Paciente'}! Aqui estão seus materiais para download.
            </div>
            
            <div class="file-list">
                ${files.map(file => `
                    <div class="file-item">
                        <div class="file-info">
                            <div class="file-name">${file.nome || file.name}</div>
                            <div class="file-desc">${file.descricao || file.description || 'Material educativo'}</div>
                        </div>
                        <a href="https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/serve-content/download/${token}/${encodeURIComponent(file.nome || file.name)}" class="download-btn" download>
                            📥 Download
                        </a>
                    </div>
                `).join('')}
            </div>
            
            <div class="expires">
                ⚠️ Este link expira em: ${new Date(contentAccess.expires_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
            </div>
            
            <div class="footer">
                Se você tiver alguma dúvida, entre em contato conosco.<br>
                Este link é pessoal e intransferível.
            </div>
        </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8' 
      },
    });

  } catch (error) {
    console.error('❌ Error in serve-content function:', error);
    return new Response('Erro interno do servidor', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});