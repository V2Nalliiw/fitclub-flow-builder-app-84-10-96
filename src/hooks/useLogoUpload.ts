
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useLogoUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadAppLogo = async (file: File): Promise<string | null> => {
    if (!user || user.role !== 'super_admin') {
      toast.error('Apenas super administradores podem alterar o logo do app');
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `app-logo.${fileExt}`;
      const filePath = fileName;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('app-logo')
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
        .from('app-logo')
        .getPublicUrl(filePath);

      toast.success('Logo do app enviado com sucesso!');
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload do logo:', error);
      toast.error('Erro ao enviar logo: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadClinicLogo = async (file: File, clinicId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload');
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `clinic-logo-${clinicId}.${fileExt}`;
      const filePath = fileName;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('clinic-logos')
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
        .from('clinic-logos')
        .getPublicUrl(filePath);

      toast.success('Logo da clínica enviado com sucesso!');
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload do logo da clínica:', error);
      toast.error('Erro ao enviar logo: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAppLogo,
    uploadClinicLogo,
    uploading,
  };
};
