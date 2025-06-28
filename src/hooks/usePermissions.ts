
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
          canCreateFlows: true,
          canEditFlows: true,
          canDeleteFlows: true,
          canAssignFlows: true,
          canViewAllFlows: true,
        };

      case 'clinic':
        return {
          ...basePermissions,
          // Clínica - funcionalidades específicas
          canManageFlows: true,
          canCreateFlows: true,
          canEditFlows: true,
          canDeleteFlows: true,
          canAssignFlows: true,
          canViewOwnFlows: true,
          canManagePatients: true,
          canViewClinicSettings: true,
          canManageTeam: true,
          canViewForms: true,
          canCreateForms: true,
          canViewDashboard: true,
          canCreatePatientAccounts: true,
        };

      case 'patient':
        return {
          ...basePermissions,
          // Paciente - acesso limitado
          canViewOwnFlows: true,
          canExecuteFlows: true,
          canRespondForms: true,
          canViewDashboard: true,
          canViewTipsAndForms: true,
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
