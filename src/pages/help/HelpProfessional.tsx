import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  Users, 
  FileText, 
  BarChart3,
  ArrowLeft,
  CheckCircle,
  User,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpProfessional = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Users, label: 'Meus Pacientes', path: '/patients' },
    { icon: FileText, label: 'Fluxos Ativos', path: '/my-flows' },
    { icon: BarChart3, label: 'Relatórios', path: '/analytics' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 text-white p-2 rounded-lg">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Profissional
            </h1>
            <p className="text-muted-foreground">
              Atenda pacientes e execute protocolos de forma eficiente
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente suas principais atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
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
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suas Responsabilidades</CardTitle>
              <CardDescription>
                Como profissional, você é responsável pelo atendimento direto aos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    O que você pode fazer:
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Acessar lista de pacientes atribuídos</li>
                    <li>• Visualizar respostas de questionários</li>
                    <li>• Executar protocolos de atendimento</li>
                    <li>• Gerar relatórios dos seus pacientes</li>
                    <li>• Acompanhar progresso dos tratamentos</li>
                    <li>• Atualizar status de fluxos</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Fluxo de trabalho típico:
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>1. Revisar pacientes agendados</li>
                    <li>2. Verificar questionários pendentes</li>
                    <li>3. Analisar respostas recebidas</li>
                    <li>4. Executar protocolo apropriado</li>
                    <li>5. Documentar atendimento</li>
                    <li>6. Definir próximos passos</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Visualizando Pacientes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse "Pacientes" para ver sua lista</li>
                    <li>• Use filtros para encontrar pacientes específicos</li>
                    <li>• Clique em um paciente para ver detalhes completos</li>
                    <li>• Verifique status dos fluxos atribuídos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Informações Disponíveis</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Dados Pessoais</h4>
                      <p className="text-xs text-muted-foreground">
                        Nome, idade, contato, histórico médico
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Questionários</h4>
                      <p className="text-xs text-muted-foreground">
                        Respostas anteriores, questionários pendentes
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Progresso</h4>
                      <p className="text-xs text-muted-foreground">
                        Evolução do tratamento, marcos atingidos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Próximas Ações</h4>
                      <p className="text-xs text-muted-foreground">
                        Consultas agendadas, exames pendentes
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Acompanhamento</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Monitor respostas em tempo real</li>
                    <li>• Receba notificações de questionários concluídos</li>
                    <li>• Identifique pacientes que precisam de atenção</li>
                    <li>• Documente observações importantes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executando Protocolos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Protocolos</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Avaliação Inicial</h4>
                      <p className="text-xs text-muted-foreground">
                        Questionários abrangentes para novos pacientes
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Acompanhamento</h4>
                      <p className="text-xs text-muted-foreground">
                        Questionários periódicos para monitorar progresso
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Pré-Consulta</h4>
                      <p className="text-xs text-muted-foreground">
                        Coleta de informações antes do atendimento
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Pós-Tratamento</h4>
                      <p className="text-xs text-muted-foreground">
                        Avaliação de resultados e satisfação
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Executando um Protocolo</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Selecione o paciente na sua lista</li>
                    <li>• Escolha o protocolo apropriado</li>
                    <li>• Configure parâmetros específicos se necessário</li>
                    <li>• Atribua ao paciente com prazo definido</li>
                    <li>• Monitore o progresso das respostas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Analisando Respostas</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Revise respostas assim que chegarem</li>
                    <li>• Identifique padrões e tendências</li>
                    <li>• Marque respostas que requerem atenção</li>
                    <li>• Use dados para orientar decisões clínicas</li>
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
                Relatórios e Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Relatórios</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Individual</h4>
                      <p className="text-xs text-muted-foreground">
                        Progresso detalhado de um paciente específico
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Por Período</h4>
                      <p className="text-xs text-muted-foreground">
                        Atividades em um intervalo de tempo
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Por Protocolo</h4>
                      <p className="text-xs text-muted-foreground">
                        Eficácia de protocolos específicos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Comparativo</h4>
                      <p className="text-xs text-muted-foreground">
                        Comparação entre diferentes pacientes
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Gerando Relatórios</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse "Analytics" no menu principal</li>
                    <li>• Selecione o tipo de relatório desejado</li>
                    <li>• Configure filtros e parâmetros</li>
                    <li>• Visualize dados em gráficos e tabelas</li>
                    <li>• Exporte para PDF ou Excel se necessário</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Indicadores Importantes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Taxa de conclusão de questionários</li>
                    <li>• Tempo médio de resposta</li>
                    <li>• Evolução de scores e métricas</li>
                    <li>• Aderência ao tratamento</li>
                    <li>• Satisfação do paciente</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Monitoramento em Tempo Real
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Dashboard com estatísticas atualizadas</li>
                    <li>• Notificações de questionários concluídos</li>
                    <li>• Alertas para pacientes que precisam de atenção</li>
                    <li>• Resumo diário das atividades</li>
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

export default HelpProfessional;