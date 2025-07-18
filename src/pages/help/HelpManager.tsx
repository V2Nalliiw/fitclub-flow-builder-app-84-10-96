import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  ArrowLeft,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpManager = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Users, label: 'Supervisionar Equipe', path: '/team' },
    { icon: BarChart3, label: 'Relatórios', path: '/analytics' },
    { icon: FileText, label: 'Protocolos', path: '/flows' },
    { icon: Users, label: 'Pacientes', path: '/patients' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Gerente
            </h1>
            <p className="text-muted-foreground">
              Supervisione equipes e coordene operações da clínica
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações de Supervisão
          </CardTitle>
          <CardDescription>
            Principais funcionalidades para gestão e coordenação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate(action.path)}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guias Detalhados */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsabilidades do Gerente</CardTitle>
              <CardDescription>
                Como gerente, você coordena operações e supervisiona a equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold">Supervisão de Equipe</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Monitorar performance dos profissionais</li>
                    <li>• Distribuir pacientes entre a equipe</li>
                    <li>• Acompanhar produtividade individual</li>
                    <li>• Identificar necessidades de treinamento</li>
                    <li>• Resolver conflitos e questões operacionais</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Gestão Operacional</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Otimizar fluxos de trabalho</li>
                    <li>• Garantir qualidade dos protocolos</li>
                    <li>• Monitorar prazos e entregas</li>
                    <li>• Coordenar recursos e materiais</li>
                    <li>• Implementar melhorias contínuas</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Planejamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Organizar cronogramas, definir metas e alocar recursos
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Execução</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Coordenar atividades diárias e garantir qualidade
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Controle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monitorar resultados e implementar correções
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Supervisão de Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Monitoramento de Performance</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Visualize estatísticas de produtividade individual</li>
                    <li>• Acompanhe tempo médio de atendimento</li>
                    <li>• Monitore taxa de conclusão de protocolos</li>
                    <li>• Identifique gargalos e oportunidades</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Distribuição de Trabalho</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Balanceamento de Carga</h4>
                      <p className="text-xs text-muted-foreground">
                        Distribuir pacientes considerando capacidade e especialidade
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Especialização</h4>
                      <p className="text-xs text-muted-foreground">
                        Alocar profissionais conforme área de expertise
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Desenvolvimento da Equipe</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Identificar necessidades de capacitação</li>
                    <li>• Organizar treinamentos internos</li>
                    <li>• Definir metas individuais e coletivas</li>
                    <li>• Promover feedback contínuo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestão Operacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Planejamento e Cronogramas
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Definir cronogramas de atendimento</li>
                    <li>• Planejar capacidade por período</li>
                    <li>• Organizar turnos e escalas</li>
                    <li>• Coordenar atividades especiais</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Qualidade dos Protocolos</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Revisão Contínua</h4>
                      <p className="text-xs text-muted-foreground">
                        Analizar eficácia dos protocolos e sugerir melhorias
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Padronização</h4>
                      <p className="text-xs text-muted-foreground">
                        Garantir consistência nos procedimentos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Compliance</h4>
                      <p className="text-xs text-muted-foreground">
                        Assegurar conformidade com diretrizes
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Gestão de Exceções
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Identificar situações atípicas</li>
                    <li>• Definir procedimentos de exceção</li>
                    <li>• Escalar questões complexas</li>
                    <li>• Documentar soluções para futuras referências</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios Gerenciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Relatórios de Performance</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Equipe</h4>
                      <p className="text-xs text-muted-foreground">
                        Produtividade individual e coletiva, horas trabalhadas
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Operacional</h4>
                      <p className="text-xs text-muted-foreground">
                        Volumes de atendimento, tempos médios, qualidade
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Pacientes</h4>
                      <p className="text-xs text-muted-foreground">
                        Satisfação, aderência, resultados clínicos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Recursos</h4>
                      <p className="text-xs text-muted-foreground">
                        Utilização de recursos, custos, eficiência
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">KPIs Gerenciais</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Taxa de utilização da equipe</li>
                    <li>• Tempo médio por atendimento</li>
                    <li>• Índice de satisfação dos pacientes</li>
                    <li>• Taxa de conclusão de protocolos</li>
                    <li>• Produtividade por profissional</li>
                    <li>• Qualidade dos dados coletados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dashboards Executivos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Visão consolidada em tempo real</li>
                    <li>• Alertas automáticos para desvios</li>
                    <li>• Comparativos históricos</li>
                    <li>• Projeções e tendências</li>
                    <li>• Exportação para apresentações</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Análise de Tendências</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Identificar padrões sazonais</li>
                    <li>• Prever demandas futuras</li>
                    <li>• Otimizar alocação de recursos</li>
                    <li>• Planejar expansão ou redução</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpManager;