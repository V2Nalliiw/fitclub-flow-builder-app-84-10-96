
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
      // Use rpc call to avoid type issues
      const { data, error } = await supabase.rpc('get_clinic_documents');
      
      if (error) {
        console.error('Error loading documents via RPC:', error);
        // Fallback to direct query with type casting
        const { data: directData, error: directError } = await (supabase as any)
          .from('clinic_documents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        setDocuments(directData || []);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
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

        // Use type casting for the insert operation
        const { error } = await (supabase as any)
          .from('clinic_documents')
          .insert({
            clinic_id: profile.clinic_id,
            filename: uploadedFile.id,
            original_name: file.name,
            file_url: uploadedFile.url,
            file_type: file.type,
            file_size: file.size,
            file_hash: fileHash,
            description: description || null,
            created_by: user.id
          });

        if (error) throw error;

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
      const { error } = await (supabase as any)
        .from('clinic_documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;

      toast.success('Documento removido da galeria');
      loadDocuments();
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
    }
  };

  if (loading) {
    return <div>Carregando galeria...</div>;
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className={`cursor-pointer transition-colors ${
              selectedDocument?.id === doc.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => onDocumentSelect?.(doc)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-blue-500" />
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
    </div>
  );
};
