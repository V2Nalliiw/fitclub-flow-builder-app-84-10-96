
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Workflow, FileText, Activity } from 'lucide-react';
import PatientDashboard from '@/pages/PatientDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { FlowAssignmentsList } from '@/components/dashboard/FlowAssignmentsList';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dashboard específico para pacientes
  if (user.role === 'patient') {
    return <PatientDashboard />;
  }

  // Dashboard para clínicas e super_admin
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo, {user.name}
          </p>
        </div>
      </div>

      {metricsLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Métricas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Pacientes"
              value={metrics?.totalUsers || 0}
              icon={Users}
              color="text-muted-foreground"
              change={{ value: 12, label: "este mês" }}
            />
            <MetricCard
              title="Fluxos Ativos"
              value={metrics?.activeFlows || 0}
              icon={Workflow}
              color="text-primary"
              change={{ value: 5, label: "este mês" }}
            />
            <MetricCard
              title="Formulários Respondidos"
              value={metrics?.completedExecutions || 0}
              icon={FileText}
              color="text-muted-foreground"
              change={{ value: 8, label: "este mês" }}
            />
            <MetricCard
              title="Taxa de Engajamento"
              value={`${Math.round(((metrics?.completedExecutions || 0) / Math.max(metrics?.totalExecutions || 1, 1)) * 100)}%`}
              icon={Activity}
              color="text-muted-foreground"
              change={{ value: -3, label: "este mês" }}
            />
          </div>

          {/* Conteúdo Principal */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Coluna Esquerda - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />
              <FlowAssignmentsList />
            </div>

            {/* Coluna Direita - 1/3 */}
            <div className="space-y-6">
              <ActivityFeed />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
