
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLogoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAppLogo = async (file: File): Promise<string | null> => {
    if (!user || user.role !== 'super_admin') {
      toast({
        title: "Erro",
        description: "Apenas super administradores podem alterar o logo do app",
        variant: "destructive",
      });
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

      toast({
        title: "Sucesso",
        description: "Logo do app enviado com sucesso!",
      });
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload do logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar logo: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadClinicLogo = async (file: File, clinicId: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer upload",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `clinic-logo-${clinicId}.${fileExt}`;
      const filePath = fileName;

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

      toast({
        title: "Sucesso",
        description: "Logo da clínica enviado com sucesso!",
      });
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload do logo da clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar logo: " + error.message,
        variant: "destructive",
      });
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
