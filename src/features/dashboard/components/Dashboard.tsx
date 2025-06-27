
import React from 'react';
import { Users, MessageSquare, GitBranch, TrendingUp, Building2, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PatientFlowDashboard } from '@/features/patient/components/PatientFlowDashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FlowAssignmentsList } from '@/components/dashboard/FlowAssignmentsList';
import { SystemHealthChecker } from '@/components/system/SystemHealthChecker';
import { FileUploadTester } from '@/components/system/FileUploadTester';
import { PageNavigationTester } from '@/components/system/PageNavigationTester';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: metrics, isLoading } = useDashboardMetrics();

  // Se for paciente, mostrar dashboard específico
  if (user?.role === 'patient') {
    return (
      <div className="space-y-6 px-6 py-6">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o progresso dos seus tratamentos e fluxos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Meus Tratamentos"
            value={metrics?.totalExecutions || 0}
            icon={GitBranch}
            color="text-blue-600"
            isLoading={isLoading}
          />
          <MetricCard
            title="Tratamentos Concluídos"
            value={metrics?.completedExecutions || 0}
            icon={TrendingUp}
            color="text-green-600"
            isLoading={isLoading}
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={
              metrics?.totalExecutions 
                ? `${Math.round((metrics.completedExecutions / metrics.totalExecutions) * 100)}%`
                : '0%'
            }
            icon={Activity}
            color="text-purple-600"
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PatientFlowDashboard />
          </div>
          <div className="space-y-6">
            <FlowAssignmentsList />
            <ActivityFeed />
          </div>
        </div>

        {/* Sistema de Verificação para Pacientes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SystemHealthChecker />
          <PageNavigationTester />
        </div>
      </div>
    );
  }

  const getDashboardCards = () => {
    if (!metrics) return [];

    switch (user?.role) {
      case 'super_admin':
        return [
          { 
            title: 'Total de Clínicas', 
            value: metrics.totalClinics, 
            icon: Building2, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Usuários Ativos', 
            value: metrics.totalUsers, 
            icon: Users, 
            color: 'text-green-600' 
          },
          { 
            title: 'Fluxos Totais', 
            value: metrics.totalFlows, 
            icon: GitBranch, 
            color: 'text-purple-600' 
          },
          { 
            title: 'Execuções Ativas', 
            value: metrics.totalExecutions, 
            icon: Activity, 
            color: 'text-orange-600' 
          },
        ];

      case 'clinic':
        return [
          { 
            title: 'Meus Fluxos', 
            value: metrics.totalFlows, 
            icon: GitBranch, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Fluxos Ativos', 
            value: metrics.activeFlows, 
            icon: Activity, 
            color: 'text-green-600' 
          },
          { 
            title: 'Total de Execuções', 
            value: metrics.totalExecutions, 
            icon: TrendingUp, 
            color: 'text-purple-600' 
          },
          { 
            title: 'Execuções Concluídas', 
            value: metrics.completedExecutions, 
            icon: MessageSquare, 
            color: 'text-orange-600' 
          },
        ];

      default:
        return [];
    }
  };

  const cards = getDashboardCards();

  return (
    <div className="space-y-6 px-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'super_admin' 
            ? 'Visão geral do sistema e todas as clínicas'
            : 'Aqui está um resumo das suas atividades'
          }
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <MetricCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Atribuições de Fluxos */}
      <FlowAssignmentsList />

      {/* Sistema de Verificação Completa */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SystemHealthChecker />
        <PageNavigationTester />
      </div>

      {/* Sistema de Testes para Upload */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FileUploadTester />
        <div className="space-y-6">
          <QuickActions />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
