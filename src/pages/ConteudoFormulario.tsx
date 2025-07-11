import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, AlertCircle, Image, Video, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentFile {
  id: string;
  nome: string;
  url: string;
  publicUrl?: string;
  tipo: string;
  tamanho: number;
  downloadUrl?: string;
}

interface ContentData {
  execution_id: string;
  patient_id: string;
  files: ContentFile[];
  metadata: {
    patient_name?: string;
    flow_name?: string;
    [key: string]: any;
  };
  expires_at: string;
}

export default function ConteudoFormulario() {
  const { executionId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentData, setContentData] = useState<ContentData | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!executionId || !token) {
        setError('Link inválido ou expirado');
        setLoading(false);
        return;
      }

      try {
        console.log('Carregando conteúdo para:', { executionId, token });

        // Buscar dados do content_access
        const { data, error: queryError } = await supabase
          .from('content_access')
          .select('*')
          .eq('access_token', token)
          .eq('execution_id', executionId)
          .single();

        if (queryError || !data) {
          console.error('Erro ao buscar content_access:', queryError);
          setError('Conteúdo não encontrado ou link expirado');
          setLoading(false);
          return;
        }

        // Verificar se não expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (now > expiresAt) {
          setError('Este link expirou. Solicite um novo link.');
          setLoading(false);
          return;
        }

        // Garantir que os dados estejam no formato correto
        const contentData: ContentData = {
          execution_id: data.execution_id,
          patient_id: data.patient_id,
          files: Array.isArray(data.files) ? (data.files as unknown as ContentFile[]) : [],
          metadata: (data.metadata as any) || {},
          expires_at: data.expires_at
        };

        setContentData(contentData);
        setLoading(false);

      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setError('Erro ao carregar conteúdo');
        setLoading(false);
      }
    };

    loadContent();
  }, [executionId, token]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (tipo.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (tipo.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleDownload = async (arquivo: ContentFile) => {
    try {
      console.log('Iniciando download do arquivo:', arquivo);
      
      // Tentar múltiplas URLs como fallback
      const downloadUrls = [
        // 1. URL via serve-content function
        `https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/serve-content/${token}/${encodeURIComponent(arquivo.nome)}`,
        // 2. URL direta do storage se disponível
        arquivo.url,
        // 3. URL pública alternativa
        arquivo.publicUrl
      ].filter(Boolean);
      
      let downloadSuccess = false;
      
      for (let i = 0; i < downloadUrls.length && !downloadSuccess; i++) {
        try {
          const downloadUrl = downloadUrls[i];
          console.log(`Tentativa ${i + 1}: Fazendo download via:`, downloadUrl);
          
          // Verificar se a URL é válida fazendo um HEAD request
          const response = await fetch(downloadUrl, { method: 'HEAD' });
          
          if (response.ok) {
            // URL válida, iniciar download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = arquivo.nome;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Download iniciado');
            downloadSuccess = true;
          } else {
            console.warn(`URL ${i + 1} não funcionou:`, response.status);
          }
        } catch (urlError) {
          console.warn(`Erro na URL ${i + 1}:`, urlError);
        }
      }
      
      if (!downloadSuccess) {
        toast.error('Arquivo temporariamente indisponível. Tente novamente em alguns minutos.');
      }
      
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Erro ao fazer download do arquivo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.close()}>
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const titulo = contentData?.metadata?.flow_name || 'Conteúdo do Formulário';
  const paciente = contentData?.metadata?.patient_name || 'Paciente';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {titulo}
            </CardTitle>
            <p className="text-muted-foreground">
              Olá {paciente}, aqui estão os materiais e documentos disponíveis para download
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Expira em: {new Date(contentData?.expires_at || '').toLocaleDateString('pt-BR')}</span>
              <Badge variant="outline">
                {contentData?.files?.length || 0} arquivo(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentData?.files?.map((arquivo: ContentFile) => (
                <div
                  key={arquivo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(arquivo.tipo)}
                    <div>
                      <p className="font-medium">{arquivo.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(arquivo.tamanho)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {arquivo.tipo.split('/')[1]?.toUpperCase() || 'DOC'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(arquivo)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
              
              {(!contentData?.files || contentData.files.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum arquivo disponível no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}