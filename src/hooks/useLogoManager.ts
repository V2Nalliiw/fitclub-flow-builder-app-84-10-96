
import { useAppSettings } from './useAppSettings';
import { useClinics } from './useClinics';
import { useAuth } from '@/contexts/AuthContext';

export const useLogoManager = () => {
  const { user } = useAuth();
  const { settings: appSettings } = useAppSettings();
  const { clinics } = useClinics();

  const getCurrentLogo = () => {
    // Para super admin: usar logo do app
    if (user?.role === 'super_admin') {
      return appSettings?.logo_url || '/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png';
    }

    // Para clínica: usar logo da clínica
    if (user?.role === 'clinic' && user?.clinic_id) {
      const clinic = clinics.find(c => c.id === user.clinic_id);
      return clinic?.logo_url || appSettings?.logo_url || '/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png';
    }

    // Para paciente: usar logo da clínica do paciente
    if (user?.role === 'patient' && user?.clinic_id) {
      const clinic = clinics.find(c => c.id === user.clinic_id);
      return clinic?.logo_url || appSettings?.logo_url || '/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png';
    }

    // Fallback para logo padrão
    return appSettings?.logo_url || '/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png';
  };

  return {
    currentLogo: getCurrentLogo(),
  };
};
