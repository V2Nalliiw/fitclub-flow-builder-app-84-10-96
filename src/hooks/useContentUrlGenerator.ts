import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerateContentUrlParams {
  executionId: string;
  files: Array<{
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tamanho: number;
  }>;
}

interface ContentUrlResponse {
  success: boolean;
  url: string;
  token: string;
  expires_at: string;
  files_count: number;
}

export const useContentUrlGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateContentUrl = async ({ 
    executionId, 
    files 
  }: GenerateContentUrlParams): Promise<string | null> => {
    if (!files || files.length === 0) {
      toast({
        title: "Nenhum arquivo",
        description: "Não há arquivos para gerar URL de conteúdo",
        variant: "destructive",
      });
      return null;
    }

    setGenerating(true);

    try {
      console.log('Gerando URL de conteúdo para:', { executionId, filesCount: files.length });

      const { data, error } = await supabase.functions.invoke('generate-content-url', {
        body: {
          executionId,
          files: files.map(file => ({
            id: file.id,
            nome: file.nome,
            url: file.url,
            tipo: file.tipo,
            tamanho: file.tamanho
          }))
        }
      });

      if (error) {
        console.error('Erro ao gerar URL:', error);
        throw error;
      }

      const response = data as ContentUrlResponse;

      if (!response.success) {
        throw new Error('Falha ao gerar URL de conteúdo');
      }

      console.log('URL de conteúdo gerada:', response.url);

      toast({
        title: "URL gerada",
        description: `URL de conteúdo criada com ${response.files_count} arquivo(s)`,
      });

      return response.url;

    } catch (error: any) {
      console.error('Erro ao gerar URL de conteúdo:', error);
      toast({
        title: "Erro ao gerar URL",
        description: error.message || 'Erro interno do servidor',
        variant: "destructive",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateContentUrl,
    generating,
  };
};