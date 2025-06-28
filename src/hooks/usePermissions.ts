
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
          // Super Admin - acesso limitado conforme especificado
          canManageClinics: true,
          canViewAllData: true,
          canManageUsers: true,
          canConfigureWhatsApp: true,
          canViewAppSettings: true,
          canViewDashboard: true,
        };

      case 'clinic':
        return {
          ...basePermissions,
          // Clínica - funcionalidades específicas
          canManageFlows: true,
          canManagePatients: true,
          canViewAnalytics: false, // Removido conforme solicitado
          canViewClinicSettings: true,
          canManageTeam: true,
          canViewForms: true,
          canCreateForms: true,
          canViewDashboard: true,
          canCreatePatientAccounts: true, // Nova permissão para criar contas de pacientes
        };

      case 'patient':
        return {
          ...basePermissions,
          // Paciente - acesso limitado
          canViewOwnFlows: true,
          canRespondForms: true,
          canViewDashboard: true,
          canViewTipsAndForms: true, // Nova permissão específica
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
