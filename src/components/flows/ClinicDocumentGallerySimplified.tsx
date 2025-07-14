
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File, X, Eye } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ClinicDocument } from '@/hooks/useClinicDocuments';

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
  const { user } = useAuth();
  const { uploadFile, uploading } = useFileUpload('clinic-gallery');
  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      // Use direct URL constants to avoid accessing protected properties
      const SUPABASE_URL = "https://oilnybhaboefqyhjrmvl.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ2NzksImV4cCI6MjA2NjQ1MDY3OX0.QzSb4EzbVXh3UmWhHiMNP9fsctIJv2Uqg2Bia6ntZAY";
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/clinic_documents?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      // Fallback to empty array if table doesn't exist yet
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
      doc.original_filename === file.name && doc.file_size === file.size
    );

    if (existingDoc) {
      toast.error('Este arquivo já existe na galeria');
      return;
    }

    const uploadedFile = await uploadFile(file);
    if (uploadedFile) {
      try {
        // Get user profile for clinic_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.clinic_id) {
          toast.error('Usuário não associado a uma clínica');
          return;
        }

        // Create hash from file name + size for duplicate detection
        const fileHash = `${file.name}_${file.size}`;

        const documentData = {
          clinic_id: profile.clinic_id,
          filename: uploadedFile.id,
          original_filename: file.name,
          file_url: uploadedFile.url,
          file_type: file.type,
          file_size: file.size,
          category: 'geral',
          description: description || null,
          created_by: user.id
        };

        // Use direct URL constants to avoid accessing protected properties
        const SUPABASE_URL = "https://oilnybhaboefqyhjrmvl.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ2NzksImV4cCI6MjA2NjQ1MDY3OX0.QzSb4EzbVXh3UmWhHiMNP9fsctIJv2Uqg2Bia6ntZAY";
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/clinic_documents`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(documentData)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save document');
        }

        toast.success('Documento adicionado à galeria');
        setDescription('');
        loadDocuments();
      } catch (error) {
        console.error('Erro ao salvar documento:', error);
        toast.error('Erro ao salvar documento na galeria');
      }
    }
  };

  const handleDelete = async (document: ClinicDocument) => {
    try {
      // Use direct URL constants to avoid accessing protected properties
      const SUPABASE_URL = "https://oilnybhaboefqyhjrmvl.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ2NzksImV4cCI6MjA2NjQ1MDY3OX0.QzSb4EzbVXh3UmWhHiMNP9fsctIJv2Uqg2Bia6ntZAY";
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/clinic_documents?id=eq.${document.id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Documento removido da galeria');
      loadDocuments();
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
                selectedDocuments.some(selected => selected.id === doc.id)
                  ? 'ring-2 ring-primary bg-primary/10 dark:bg-primary/5' 
                  : 'hover:bg-muted/50 dark:hover:bg-muted'
              }`}
              onClick={() => {
                if (multiSelect) {
                  const isSelected = selectedDocuments.some(selected => selected.id === doc.id);
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{doc.original_filename}</h4>
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

export { ClinicDocumentGallerySimplified as ClinicDocumentGallery };
