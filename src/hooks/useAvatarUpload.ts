
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAvatarUpload = () => {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload');
      return false;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário
      const result = await updateProfile({ avatar_url: publicUrl });
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Avatar atualizado com sucesso!');
      return true;

    } catch (error: any) {
      console.error('Erro no upload do avatar:', error);
      toast.error('Erro ao enviar avatar: ' + error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    uploading,
  };
};
