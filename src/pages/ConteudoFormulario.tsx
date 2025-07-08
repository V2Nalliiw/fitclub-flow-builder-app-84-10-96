import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Video, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormContent {
  titulo: string;
  descricao: string;
  arquivos: Array<{
    nome: string;
    url: string;
    tipo: string;
  }>;
}

export default function ConteudoFormulario() {
  const { executionId } = useParams<{ executionId: string }>();
  const { toast } = useToast();
  const [content, setContent] = useState<FormContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      if (!executionId) return;

      try {
        // Buscar dados da execução
        const { data: execution, error } = await supabase
          .from('flow_executions')
          .select('current_step, flow_id')
          .eq('id', executionId)
          .single();

        if (error) throw error;

        // Primeiro, tentar obter dados do current_step se houver content_access
        let contentData: FormContent | null = null;
        
        if ((execution as any)?.current_step?.content_access) {
          const contentAccess = (execution as any).current_step.content_access;
          contentData = {
            titulo: 'Conteúdo do Formulário',
            descricao: 'Arquivos disponíveis para download',
            arquivos: contentAccess.files || []
          };
        } else {
          // Buscar o flow para obter os nós como fallback
          const { data: flow } = await supabase
            .from('flows')
            .select('nodes')
            .eq('id', (execution as any).flow_id)
            .single();

          if (flow) {
            const nodes = (flow as any).nodes || [];
            const formEndNode = nodes.find((node: any) => node.type === 'formEnd');
            
            if (formEndNode && formEndNode.data) {
              contentData = {
                titulo: formEndNode.data.titulo || 'Conteúdo do Formulário',
                descricao: formEndNode.data.descricao || '',
                arquivos: formEndNode.data.arquivos || []
              };
            }
          }
        }

        setContent(contentData);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o conteúdo",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [executionId, toast]);

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (tipo.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (tipo.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleDownload = (arquivo: any) => {
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = arquivo.url;
    link.download = arquivo.nome;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Conteúdo não encontrado</h3>
              <p className="text-muted-foreground">
                O conteúdo solicitado não está disponível ou expirou.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {content.titulo}
            </CardTitle>
            {content.descricao && (
              <p className="text-muted-foreground">{content.descricao}</p>
            )}
          </CardHeader>
          
          <CardContent>
            {content.arquivos && content.arquivos.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Arquivos Disponíveis</h3>
                <div className="grid gap-3">
                  {content.arquivos.map((arquivo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(arquivo.tipo)}
                        <div>
                          <p className="font-medium">{arquivo.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {arquivo.tipo}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(arquivo)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhum arquivo disponível</h3>
                <p className="text-muted-foreground">
                  Não há arquivos para download neste momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}