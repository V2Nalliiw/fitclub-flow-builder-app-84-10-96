
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Eye, Download } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClinicDocument {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
}

interface ClinicDocumentGalleryProps {
  onDocumentSelect?: (document: ClinicDocument) => void;
  selectedDocument?: ClinicDocument | null;
}

export const ClinicDocumentGallery: React.FC<ClinicDocumentGalleryProps> = ({
  onDocumentSelect,
  selectedDocument
}) => {
  const { user } = useAuth();
  const { uploadFile, uploading } = useFileUpload('clinic-materials');
  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user profile for clinic_id first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setDocuments([]);
        return;
      }

      if (!profile?.clinic_id) {
        console.log('No clinic_id found for user');
        setDocuments([]);
        return;
      }

      // Since clinic_documents table might not exist, we'll use a simulated approach
      // In a real implementation, you would create this table first
      setDocuments([]);
      
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check for duplicates by file size and name
    const existingDoc = documents.find(doc => 
      doc.original_name === file.name && doc.file_size === file.size
    );

    if (existingDoc) {
      toast.error('Este arquivo já existe na galeria');
      return;
    }

    const uploadedFile = await uploadFile(file);
    if (uploadedFile) {
      try {
        // Get user profile for clinic_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile?.clinic_id) {
          toast.error('Usuário não associado a uma clínica');
          return;
        }

        // Create a new document object
        const newDocument: ClinicDocument = {
          id: crypto.randomUUID(),
          filename: uploadedFile.id,
          original_name: file.name,
          file_url: uploadedFile.url,
          file_type: file.type,
          file_size: file.size,
          description: description || undefined,
          created_at: new Date().toISOString()
        };

        // Add to local state (in a real app, this would be saved to database)
        setDocuments(prev => [newDocument, ...prev]);
        toast.success('Documento adicionado à galeria');
        setDescription('');
        
      } catch (error) {
        console.error('Erro ao salvar documento:', error);
        toast.error('Erro ao salvar documento na galeria');
      }
    }
  };

  const handleDelete = async (document: ClinicDocument) => {
    try {
      // Remove from local state (in a real app, this would delete from database)
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast.success('Documento removido da galeria');
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Galeria de Documentos da Clínica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Descrição (opcional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do documento..."
            />
          </div>
          
          <div className="space-y-3">
            <Label>Adicionar Documento</Label>
            <Input
              type="file"
              accept="application/pdf,image/*,video/mp4"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-primary">Enviando arquivo...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento na galeria
            </h3>
            <p className="text-gray-600">
              Faça upload de documentos que os pacientes poderão baixar nos formulários.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card 
              key={doc.id} 
              className={`cursor-pointer transition-colors ${
                selectedDocument?.id === doc.id 
                  ? 'ring-2 ring-primary bg-primary/10 dark:bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onDocumentSelect?.(doc)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{doc.original_name}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.file_type} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.file_url, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
