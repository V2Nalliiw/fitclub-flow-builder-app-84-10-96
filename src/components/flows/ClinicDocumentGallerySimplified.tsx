
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File, X, Eye, Upload, Plus, CheckCircle } from 'lucide-react';
import { useClinicDocuments, ClinicDocument } from '@/hooks/useClinicDocuments';
import { toast } from 'sonner';

interface ClinicDocumentGalleryProps {
  onDocumentSelect?: (documents: ClinicDocument[]) => void;
  selectedDocuments?: ClinicDocument[];
  multiSelect?: boolean;
}

export const ClinicDocumentGallerySimplified: React.FC<ClinicDocumentGalleryProps> = ({
  onDocumentSelect,
  selectedDocuments = [],
  multiSelect = false
}) => {
  const { 
    documents, 
    loading, 
    uploading, 
    uploadDocument, 
    deleteDocument 
  } = useClinicDocuments();
  const [description, setDescription] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadDocument(file, 'geral', undefined, description || undefined);
      setDescription('');
      // Reset file input
      event.target.value = '';
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    try {
      await uploadDocument(file, 'geral', undefined, description || undefined);
      setDescription('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (document: ClinicDocument) => {
    try {
      await deleteDocument(document.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-3">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-primary font-medium">Enviando arquivo...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Arraste e solte ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground">PDF, imagens e vídeos MP4</p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Descrição (opcional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="max-w-xs mx-auto"
                    />
                    <div>
                      <Input
                        type="file"
                        accept="application/pdf,image/*,video/mp4"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <File className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum documento na galeria. Faça upload para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDocuments.some(selected => selected.id === doc.id);
            return (
              <Card 
                key={doc.id} 
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  if (multiSelect) {
                    if (isSelected) {
                      onDocumentSelect?.(selectedDocuments.filter(selected => selected.id !== doc.id));
                    } else {
                      onDocumentSelect?.([...selectedDocuments, doc]);
                    }
                  } else {
                    onDocumentSelect?.([doc]);
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative">
                        <File className="h-6 w-6 text-primary" />
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{doc.original_filename}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.file_type.split('/')[1]?.toUpperCase()}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.file_url, '_blank');
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc);
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { ClinicDocumentGallerySimplified as ClinicDocumentGallery };
