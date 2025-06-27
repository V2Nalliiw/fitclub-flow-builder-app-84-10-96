
import React from 'react';
import { PatientFlowDashboard } from '@/features/patient/components/PatientFlowDashboard';

export const MyFlows = () => {
  return (
    <div className="container mx-auto py-6 space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Fluxos</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o progresso de todos os seus tratamentos e atividades
        </p>
      </div>

      <PatientFlowDashboard />
    </div>
  );
};
