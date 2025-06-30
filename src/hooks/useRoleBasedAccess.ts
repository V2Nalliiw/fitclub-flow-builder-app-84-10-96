
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useRoleBasedAccess = (allowedRoles: ('super_admin' | 'clinic' | 'patient')[]) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        
        // Redirecionar baseado no papel do usuário
        switch (user.role) {
          case 'patient':
            navigate('/dashboard');
            break;
          case 'clinic':
            navigate('/dashboard');
            break;
          case 'super_admin':
            navigate('/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, isLoading, allowedRoles, navigate, toast]);

  return {
    hasAccess: user && allowedRoles.includes(user.role),
    isLoading,
    user
  };
};
