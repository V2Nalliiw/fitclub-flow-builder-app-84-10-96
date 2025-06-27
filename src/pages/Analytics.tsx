
import React from 'react';
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';

export const Analytics = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe métricas e relatórios da clínica
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
};
