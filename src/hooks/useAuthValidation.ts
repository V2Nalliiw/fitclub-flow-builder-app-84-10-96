
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuthValidation = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const requireAuth = () => {
    if (!isLoading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      navigate('/');
      return false;
    }
    return true;
  };

  const requireRole = (requiredRole: 'super_admin' | 'clinic' | 'patient') => {
    if (!requireAuth()) return false;
    
    if (user?.role !== requiredRole) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return false;
    }
    return true;
  };

  const isClinicUser = () => user?.role === 'clinic';
  const isSuperAdmin = () => user?.role === 'super_admin';
  const isPatient = () => user?.role === 'patient';

  return {
    user,
    isLoading,
    requireAuth,
    requireRole,
    isClinicUser,
    isSuperAdmin,
    isPatient,
  };
};
