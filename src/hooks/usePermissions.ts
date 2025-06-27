
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return {};

    const basePermissions = {
      // Permissões básicas para todos os usuários autenticados
      canViewProfile: true,
      canEditProfile: true,
    };

    switch (user.role) {
      case 'super_admin':
        return {
          ...basePermissions,
          // Super Admin tem acesso a tudo
          canManageClinics: true,
          canViewAllData: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageFlows: true,
          canManagePatients: true,
          canConfigureWhatsApp: true,
          canViewSettings: true,
          canManageTeam: true,
          canManagePermissions: true,
        };

      case 'clinic':
        return {
          ...basePermissions,
          // Clínica pode gerenciar seus próprios dados
          canManageFlows: true,
          canManagePatients: true,
          canConfigureWhatsApp: true,
          canViewAnalytics: true,
          canViewSettings: true,
          canManageTeam: user.is_chief || false,
          canViewForms: true,
          canCreateForms: true,
        };

      case 'patient':
        return {
          ...basePermissions,
          // Paciente tem acesso limitado
          canViewOwnFlows: true,
          canRespondForms: true,
        };

      default:
        return basePermissions;
    }
  }, [user]);

  const hasPermission = (permission: keyof typeof permissions) => {
    return Boolean(permissions[permission]);
  };

  return {
    permissions,
    hasPermission,
    userRole: user?.role,
    isAuthenticated: Boolean(user),
  };
};
