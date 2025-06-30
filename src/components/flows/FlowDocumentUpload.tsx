
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Eye } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface FlowDocumentUploadProps {
  onFileUploaded: (file: { name: string; url: string; type: string }) => void;
  currentFile?: { name: string; url: string; type: string } | null;
  acceptedTypes?: string[];
}

export const FlowDocumentUpload: React.FC<FlowDocumentUploadProps> = ({
  onFileUploaded,
  currentFile,
  acceptedTypes = ['application/pdf', 'image/*', 'video/mp4']
}) => {
  const [dragOver, setDragOver] = useState(false);
  const { uploadFile, uploading } = useFileUpload('flow-documents');

  const handleFileSelect = async (file: File) => {
    if (!acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type;
    })) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }

    const uploadedFile = await uploadFile(file);
    if (uploadedFile) {
      onFileUploaded({
        name: uploadedFile.name,
        url: uploadedFile.url,
        type: file.type
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    onFileUploaded({ name: '', url: '', type: '' });
  };

  return (
    <div className="space-y-4">
      <Label>Documento/Mídia</Label>
      
      {currentFile && currentFile.url ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{currentFile.name}</p>
                  <p className="text-sm text-gray-500">{currentFile.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentFile.url, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arraste um arquivo ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDFs, imagens, vídeos (até 100MB)
            </p>
            <Input
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
