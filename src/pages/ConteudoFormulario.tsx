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
  // Legacy properties from different formats
  original_filename?: string;
  filename?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
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
          files: Array.isArray(data.files) ? (data.files as unknown as ContentFile[]).map(file => ({
            ...file,
            nome: file.nome || file.original_filename || file.filename || 'Arquivo sem nome',
            url: file.url || file.file_url || file.publicUrl || '',
            tipo: file.tipo || file.file_type || 'application/octet-stream',
            tamanho: file.tamanho || file.file_size || 0
          })) : [],
          metadata: (data.metadata as any) || {},
          expires_at: data.expires_at
        };

        console.log('📁 ConteudoFormulario: Dados carregados:', contentData);

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
      console.log('🔽 ConteudoFormulario: Iniciando download do arquivo:', arquivo);
      
      if (!token) {
        toast.error('Token de acesso não encontrado');
        return;
      }
      
      // ✨ CORRIGIDO: Usar Edge Function para download direto de arquivo
      const downloadUrl = `https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/serve-content/download/${token}/${encodeURIComponent(arquivo.nome)}`;
      
      console.log('🔗 ConteudoFormulario: URL de download:', downloadUrl);
      
      try {
        console.log('📥 Fazendo download via edge function...');
        
        const response = await fetch(downloadUrl);
        
        if (response.ok) {
          const blob = await response.blob();
          
          // Verificar se o blob tem conteúdo válido
          if (blob.size === 0) {
            throw new Error('Arquivo vazio recebido');
          }
          
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = arquivo.nome;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(url);
          
          toast.success(`Download de "${arquivo.nome}" iniciado com sucesso`);
          console.log('✅ Download bem-sucedido');
        } else {
          const errorText = await response.text();
          console.warn(`❌ Edge function falhou (${response.status}):`, errorText);
          
          // FALLBACK: Tentar download direto via URL original
          if (arquivo.url && arquivo.url.startsWith('http')) {
            console.log('🔄 Tentando download direto via URL original...');
            
            const link = document.createElement('a');
            link.href = arquivo.url;
            link.download = arquivo.nome;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Download de "${arquivo.nome}" iniciado`);
            console.log('✅ Download via URL direta bem-sucedido');
          } else {
            throw new Error(`Servidor retornou ${response.status}: ${errorText}`);
          }
        }
      } catch (downloadError: any) {
        console.error('❌ Erro no download:', downloadError);
        toast.error(`Não foi possível baixar "${arquivo.nome}". ${downloadError.message}`);
      }
      
    } catch (error: any) {
      console.error('❌ ConteudoFormulario: Erro crítico no download:', error);
      toast.error(`Erro inesperado ao baixar "${arquivo.nome}": ${error.message}`);
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