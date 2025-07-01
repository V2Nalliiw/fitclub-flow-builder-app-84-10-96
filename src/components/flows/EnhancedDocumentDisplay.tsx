
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Film, 
  Image, 
  ExternalLink,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnhancedDocumentDisplayProps {
  document: {
    id: string;
    name: string;
    url: string;
    type?: string;
    size?: string;
    description?: string;
    uploadedAt?: string;
    uploadedBy?: string;
    category?: string;
    version?: string;
  };
  title?: string;
  showMetadata?: boolean;
  onView?: () => void;
  onDownload?: () => void;
}

export const EnhancedDocumentDisplay: React.FC<EnhancedDocumentDisplayProps> = ({
  document,
  title,
  showMetadata = true,
  onView,
  onDownload
}) => {
  const [imageError, setImageError] = useState(false);

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

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'educativo':
        return 'bg-[#5D8701]/10 text-[#5D8701] dark:bg-[#5D8701]/20 dark:text-[#5D8701]';
      case 'formulário':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'orientação':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      window.open(document.url, '_blank');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = document.type?.includes('image');
  const isVideo = document.type?.includes('video');

  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-lg flex items-center justify-center text-white flex-shrink-0">
              {getFileIcon(document.type || '')}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
                {title || document.name}
              </CardTitle>
              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {document.category && (
              <Badge className={getCategoryColor(document.category)}>
                {document.category}
              </Badge>
            )}
            {document.version && (
              <Badge variant="outline" className="text-xs">
                v{document.version}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview para imagens */}
        {isImage && !imageError && (
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
            <img
              src={document.url}
              alt={document.name}
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Preview para vídeos */}
        {isVideo && (
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
            <video
              src={document.url}
              className="w-full h-48 object-cover"
              controls={false}
              poster=""
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                <Film className="h-8 w-8 text-gray-700" />
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" />
              <span>{getFileTypeLabel(document.type || '')}</span>
            </div>
            
            {document.size && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="w-4 h-4 flex items-center justify-center text-xs font-mono">
                  📁
                </span>
                <span>{document.size}</span>
              </div>
            )}

            {document.uploadedAt && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(document.uploadedAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            )}

            {document.uploadedBy && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span>{document.uploadedBy}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex items-center gap-2 flex-1"
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2 flex-1 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="px-3"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
