import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RobustDocumentDownloadProps {
  fileName: string;
  fileUrl?: string;
  title?: string;
  description?: string;
  fileType?: 'pdf' | 'image' | 'video' | 'ebook';
  documentId?: string;
}

export const RobustDocumentDownload: React.FC<RobustDocumentDownloadProps> = ({
  fileName,
  fileUrl,
  title,
  description,
  fileType = 'pdf',
  documentId
}) => {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-white" />;
      case 'image':
        return <Eye className="h-6 w-6 text-white" />;
      case 'video':
        return <ExternalLink className="h-6 w-6 text-white" />;
      default:
        return <FileText className="h-6 w-6 text-white" />;
    }
  };

  const generateSecureDownloadUrl = async (): Promise<string | null> => {
    try {
      console.log('🔗 Gerando URL para download:', { fileName, fileUrl, documentId });

      // Prioridade 1: URL direta se já válida
      if (fileUrl && fileUrl.startsWith('https://')) {
        console.log('✅ Usando URL direta:', fileUrl);
        return fileUrl;
      }

      // Prioridade 2: Buscar no banco por ID
      if (documentId) {
        const { data: document } = await supabase
          .from('clinic_documents')
          .select('file_url')
          .eq('id', documentId)
          .single();

        if (document?.file_url) {
          console.log('✅ URL do banco:', document.file_url);
          return document.file_url;
        }
      }

      // Prioridade 3: URL pública do storage
      const { data } = supabase.storage
        .from('clinic-materials')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        console.log('✅ URL pública:', data.publicUrl);
        return data.publicUrl;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao gerar URL:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    if (!fileName) {
      toast.error('Nome do arquivo não encontrado');
      return;
    }

    setDownloading(true);
    try {
      const downloadUrl = await generateSecureDownloadUrl();

      if (!downloadUrl) {
        toast.error('Não foi possível gerar link de download');
        return;
      }

      // Método robusto de download
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast.success('Download concluído!');
      console.log('✅ Download realizado com sucesso:', fileName);

    } catch (error) {
      console.error('❌ Erro durante download:', error);
      toast.error('Erro durante o download. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!fileName) {
      toast.error('Nome do arquivo não encontrado');
      return;
    }

    setPreviewing(true);
    try {
      const previewUrl = await generateSecureDownloadUrl();

      if (!previewUrl) {
        toast.error('Não foi possível gerar link de visualização');
        return;
      }

      // Abrir em nova aba
      const newWindow = window.open(previewUrl, '_blank');
      
      if (!newWindow) {
        toast.error('Pop-up bloqueado. Permita pop-ups para visualizar.');
      } else {
        toast.success('Abrindo visualização...');
      }

    } catch (error) {
      console.error('❌ Erro ao visualizar arquivo:', error);
      toast.error('Erro ao visualizar arquivo');
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <Card className="bg-muted/50 dark:bg-muted/20 border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-gradient rounded-full flex items-center justify-center flex-shrink-0">
            {getFileIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title || 'Documento'}
            </h3>
            
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                {description}
              </p>
            )}
            
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              📎 {fileName}
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleDownload}
                disabled={downloading || !fileName}
                className="bg-primary-gradient hover:opacity-90 text-white"
                size="sm"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {downloading ? 'Baixando...' : 'Baixar'}
              </Button>
              
              {fileType === 'pdf' && (
                <Button
                  onClick={handlePreview}
                  disabled={previewing || !fileName}
                  variant="outline"
                  size="sm"
                >
                  {previewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {previewing ? 'Carregando...' : 'Visualizar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};