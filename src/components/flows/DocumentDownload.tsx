
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentDownloadProps {
  fileName: string;
  fileUrl?: string;
  title?: string;
  description?: string;
  fileType?: 'pdf' | 'image' | 'video' | 'ebook';
}

export const DocumentDownload: React.FC<DocumentDownloadProps> = ({
  fileName,
  fileUrl,
  title,
  description,
  fileType = 'pdf'
}) => {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'image':
        return <Eye className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <ExternalLink className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDownload = async () => {
    if (!fileName) {
      toast.error('Nome do arquivo não encontrado');
      return;
    }

    setDownloading(true);
    try {
      // Se temos uma URL direta, usar ela
      if (fileUrl && fileUrl.startsWith('http')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download iniciado!');
        return;
      }

      // Caso contrário, tentar baixar do storage
      const filePath = fileUrl || fileName;
      
      const { data, error } = await supabase.storage
        .from('flow-documents')
        .download(filePath);

      if (error) {
        console.error('Erro ao baixar arquivo:', error);
        toast.error('Erro ao baixar arquivo: ' + error.message);
        return;
      }

      // Criar URL de blob e fazer download
      const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success('Download concluído!');
    } catch (error) {
      console.error('Erro durante download:', error);
      toast.error('Erro inesperado durante o download');
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
      let previewUrl = '';

      if (fileUrl && fileUrl.startsWith('http')) {
        previewUrl = fileUrl;
      } else {
        const filePath = fileUrl || fileName;
        const { data } = await supabase.storage
          .from('flow-documents')
          .getPublicUrl(filePath);
        
        previewUrl = data.publicUrl;
      }

      if (previewUrl) {
        window.open(previewUrl, '_blank');
      } else {
        toast.error('Não foi possível gerar link de visualização');
      }
    } catch (error) {
      console.error('Erro ao visualizar arquivo:', error);
      toast.error('Erro ao visualizar arquivo');
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
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
