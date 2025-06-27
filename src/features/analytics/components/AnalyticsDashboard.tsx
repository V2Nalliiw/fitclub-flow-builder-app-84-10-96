
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, Target, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Se não há dados suficientes, mostrar estado vazio
  if (!analytics || analytics.totalEvents === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e uso da plataforma
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sem dados ainda</h3>
            <p className="text-muted-foreground">
              Comece a usar a plataforma para ver analytics detalhados aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMetricCards = () => {
    const baseCards = [
      {
        title: 'Total de Eventos',
        value: analytics.totalEvents,
        icon: Activity,
        color: 'text-blue-600',
        change: analytics.eventsGrowth
      },
      {
        title: 'Usuários Ativos',
        value: analytics.activeUsers,
        icon: Users,
        color: 'text-green-600',
        change: analytics.usersGrowth
      },
      {
        title: 'Execuções de Fluxo',
        value: analytics.flowExecutions,
        icon: Target,
        color: 'text-purple-600',
        change: analytics.executionsGrowth
      },
      {
        title: 'Taxa de Conclusão',
        value: `${analytics.completionRate}%`,
        icon: TrendingUp,
        color: 'text-orange-600',
        change: analytics.completionGrowth
      }
    ];

    return baseCards;
  };

  const cards = getMetricCards();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">
          {user?.role === 'super_admin' 
            ? 'Visão geral de todas as clínicas'
            : 'Acompanhe o desempenho da sua clínica'
          }
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.change !== undefined && (
                      <Badge variant={card.change >= 0 ? "default" : "destructive"}>
                        {card.change >= 0 ? '+' : ''}{card.change}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Atividade por Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade por Período
            </CardTitle>
            <CardDescription>
              Eventos registrados nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Tipos de Evento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tipos de Evento
            </CardTitle>
            <CardDescription>
              Distribuição dos tipos de eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.eventTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.eventTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Clínica (apenas para super_admin) */}
      {user?.role === 'super_admin' && analytics.clinicStats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance por Clínica</CardTitle>
            <CardDescription>
              Comparativo de atividade entre clínicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.clinicStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clinic_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#8884d8" />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
