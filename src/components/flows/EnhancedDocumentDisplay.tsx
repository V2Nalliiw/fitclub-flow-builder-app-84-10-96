
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedDocumentDisplayProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  title?: string;
  description?: string;
}

export const EnhancedDocumentDisplay: React.FC<EnhancedDocumentDisplayProps> = ({
  fileName,
  fileUrl,
  fileType,
  title,
  description
}) => {
  const [downloading, setDownloading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    window.open(fileUrl, '_blank');
  };

  const renderContent = () => {
    if (fileType.startsWith('image/')) {
      return (
        <div className="space-y-4">
          <img
            src={fileUrl}
            alt={title || fileName}
            className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', e);
              toast.error('Erro ao carregar imagem');
            }}
          />
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden max-w-2xl mx-auto">
            <video
              src={fileUrl}
              controls
              className="w-full"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onVolumeChange={(e) => setVideoMuted((e.target as HTMLVideoElement).muted)}
              onError={(e) => {
                console.error('Erro ao carregar vídeo:', e);
                toast.error('Erro ao carregar vídeo');
              }}
            >
              Seu browser não suporta reprodução de vídeo.
            </video>
          </div>
        </div>
      );
    }

    // Para PDFs e outros documentos
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="h-10 w-10 text-red-500" />
        </div>
        <p className="text-gray-600 mb-4">
          📎 {fileName}
        </p>
        <Button
          onClick={handlePreview}
          variant="outline"
          className="mb-2"
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar PDF
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <CardContent className="p-6 space-y-6">
        {title && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {renderContent()}

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Baixando...' : 'Baixar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
