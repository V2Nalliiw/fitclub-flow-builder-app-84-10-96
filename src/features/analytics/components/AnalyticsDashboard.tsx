
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

// Mock data
const mockMetrics = {
  totalPatients: 142,
  activeFlows: 23,
  completedFlows: 89,
  avgResponseTime: 2.3,
  patientGrowth: 12.5,
  flowCompletionRate: 78.2
};

const mockFlowData = [
  { name: 'Jan', completed: 12, started: 15, abandoned: 3 },
  { name: 'Feb', completed: 19, started: 22, abandoned: 3 },
  { name: 'Mar', completed: 15, started: 18, abandoned: 3 },
  { name: 'Apr', completed: 22, started: 28, abandoned: 6 },
  { name: 'Mai', completed: 18, started: 23, abandoned: 5 },
  { name: 'Jun', completed: 25, started: 30, abandoned: 5 }
];

const mockPatientData = [
  { name: 'Jan', novos: 8, ativos: 45 },
  { name: 'Feb', novos: 12, ativos: 52 },
  { name: 'Mar', novos: 6, ativos: 48 },
  { name: 'Apr', novos: 15, ativos: 58 },
  { name: 'Mai', novos: 9, ativos: 62 },
  { name: 'Jun', novos: 18, ativos: 68 }
];

const mockCompletionData = [
  { name: 'Questionário Inicial', value: 92 },
  { name: 'Avaliação Física', value: 78 },
  { name: 'Exercícios', value: 65 },
  { name: 'Feedback Final', value: 43 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('flows');

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    change: number; 
    icon: any; 
    trend: 'up' | 'down' 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex items-center mt-4">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );

  const generateReport = () => {
    console.log('Generating report for:', timeRange);
    // Aqui implementaria a geração do relatório
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho e métricas da sua clínica</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Pacientes"
          value={mockMetrics.totalPatients}
          change={mockMetrics.patientGrowth}
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Fluxos Ativos"
          value={mockMetrics.activeFlows}
          change={8.2}
          icon={FileText}
          trend="up"
        />
        <MetricCard
          title="Taxa de Conclusão"
          value={`${mockMetrics.flowCompletionRate}%`}
          change={-2.1}
          icon={CheckCircle}
          trend="down"
        />
        <MetricCard
          title="Tempo Médio (dias)"
          value={mockMetrics.avgResponseTime}
          change={-15.3}
          icon={Clock}
          trend="up"
        />
      </div>

      {/* Gráficos detalhados */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="completion">Conclusão</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Fluxos</CardTitle>
              <CardDescription>
                Acompanhe fluxos iniciados, completados e abandonados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#22c55e" name="Completados" />
                  <Bar dataKey="started" fill="#3b82f6" name="Iniciados" />
                  <Bar dataKey="abandoned" fill="#ef4444" name="Abandonados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Pacientes</CardTitle>
              <CardDescription>
                Novos pacientes vs pacientes ativos ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPatientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="novos" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Novos Pacientes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ativos" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Pacientes Ativos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conclusão por Etapa</CardTitle>
                <CardDescription>
                  Onde os pacientes mais abandonam o fluxo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockCompletionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights e Recomendações</CardTitle>
                <CardDescription>
                  Sugestões baseadas nos dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Atenção</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    43% dos pacientes não completam o feedback final. 
                    Considere simplificar esta etapa.
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Sucesso</span>
                  </div>
                  <p className="text-sm text-green-700">
                    92% de conclusão no questionário inicial indica 
                    boa aceitação dos pacientes.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Sugestão</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Adicione lembretes automáticos para aumentar 
                    a taxa de conclusão dos exercícios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
