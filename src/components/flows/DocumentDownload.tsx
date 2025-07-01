
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Eye, Film, Image } from 'lucide-react';

interface DocumentDownloadProps {
  document: {
    name: string;
    url: string;
    type?: string;
    size?: string;
  };
  title?: string;
}

export const DocumentDownload: React.FC<DocumentDownloadProps> = ({ document: doc, title }) => {
  const getFileIcon = (type: string) => {
    if (type?.includes('video')) return <Film className="h-6 w-6" />;
    if (type?.includes('image')) return <Image className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type?.includes('video')) return 'Vídeo';
    if (type?.includes('image')) return 'Imagem';
    if (type?.includes('pdf')) return 'PDF';
    return 'Documento';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(doc.url, '_blank');
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-lg flex items-center justify-center text-white">
            {getFileIcon(doc.type || '')}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title || doc.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {getFileTypeLabel(doc.type || '')}
              {doc.size && ` • ${doc.size}`}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
