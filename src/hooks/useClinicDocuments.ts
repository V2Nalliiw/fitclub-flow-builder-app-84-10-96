import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ClinicDocument {
  id: string;
  clinic_id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  theme?: string;
  description?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function useClinicDocuments() {
  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading clinic documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    category: string,
    theme?: string,
    description?: string,
    tags: string[] = []
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setUploading(true);

      // Get user's clinic_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.clinic_id) throw new Error('Clinic not found');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.clinic_id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('clinic-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('clinic-materials')
        .getPublicUrl(fileName);

      // Save document record
      const { data, error: insertError } = await supabase
        .from('clinic_documents')
        .insert([{
          clinic_id: profile.clinic_id,
          filename: fileName,
          original_filename: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          category,
          theme,
          description,
          tags,
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setDocuments(prev => [data, ...prev]);
      toast.success('Documento enviado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const updateDocument = async (
    id: string, 
    updates: Partial<Pick<ClinicDocument, 'category' | 'theme' | 'description' | 'tags'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('clinic_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => prev.map(doc => doc.id === id ? data : doc));
      toast.success('Documento atualizado!');
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Erro ao atualizar documento');
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const document = documents.find(d => d.id === id);
      if (!document) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('clinic-materials')
        .remove([document.filename]);

      if (storageError) console.warn('Storage deletion error:', storageError);

      // Delete from database
      const { error } = await supabase
        .from('clinic_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Documento removido!');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao remover documento');
      throw error;
    }
  };

  const getDocumentsByCategory = (category: string) => {
    return documents.filter(doc => doc.category === category);
  };

  const getDocumentsByTheme = (theme: string) => {
    return documents.filter(doc => doc.theme === theme);
  };

  const searchDocuments = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return documents.filter(doc =>
      doc.original_filename.toLowerCase().includes(lowercaseQuery) ||
      doc.description?.toLowerCase().includes(lowercaseQuery) ||
      doc.category.toLowerCase().includes(lowercaseQuery) ||
      doc.theme?.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  return {
    documents,
    loading,
    uploading,
    loadDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCategory,
    getDocumentsByTheme,
    searchDocuments
  };
}