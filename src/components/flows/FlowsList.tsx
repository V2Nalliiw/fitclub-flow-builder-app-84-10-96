
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PatientFlowsList } from './PatientFlowsList';
import { ClinicFlowsList } from './ClinicFlowsList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const FlowsList = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Renderizar componente específico baseado no papel do usuário
  if (user.role === 'patient') {
    return <PatientFlowsList />;
  }

  // Para clínicas e super_admin
  return <ClinicFlowsList />;
};
