
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload de arquivos');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setUploadProgress(100);

      const uploadedFile: UploadedFile = {
        id: data.id || fileName,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      toast.success('Arquivo enviado com sucesso!');
      return uploadedFile;

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo: ' + error.message);
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (error) throw error;

      toast.success('Arquivo removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover arquivo: ' + error.message);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadProgress,
  };
};
