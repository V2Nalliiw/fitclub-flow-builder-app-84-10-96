import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Users, 
  FileText, 
  Phone,
  ArrowLeft,
  CheckCircle,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpAssistant = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Users, label: 'Pacientes', path: '/patients' },
    { icon: FileText, label: 'Questionários', path: '/my-flows' },
    { icon: Calendar, label: 'Agendamentos', path: '/dashboard' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Assistente
            </h1>
            <p className="text-muted-foreground">
              Apoie a equipe e ofereça suporte aos pacientes
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Suas Principais Atividades
          </CardTitle>
          <CardDescription>
            Acesse rapidamente suas responsabilidades diárias
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
          <TabsTrigger value="support">Suporte</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Papel do Assistente</CardTitle>
              <CardDescription>
                Como assistente, você oferece suporte vital à equipe e aos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Suas Responsabilidades:
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Auxiliar no acompanhamento de pacientes</li>
                    <li>• Organizar documentos e informações</li>
                    <li>• Apoiar profissionais em tarefas básicas</li>
                    <li>• Verificar status de questionários</li>
                    <li>• Comunicar-se com pacientes quando necessário</li>
                    <li>• Manter dados atualizados</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Rotina Diária:
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>1. Verificar pacientes do dia</li>
                    <li>2. Conferir questionários pendentes</li>
                    <li>3. Organizar informações necessárias</li>
                    <li>4. Auxiliar profissionais conforme demanda</li>
                    <li>5. Fazer follow-up de tarefas</li>
                    <li>6. Atualizar status e documentos</li>
                  </ol>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Organização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manter informações organizadas e acessíveis
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Comunicação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Facilitar comunicação entre equipe e pacientes
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Suporte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Oferecer apoio nas atividades da clínica
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Suporte aos Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Acompanhamento Básico</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Verificar se pacientes receberam convites</li>
                    <li>• Conferir se conseguiram acessar o sistema</li>
                    <li>• Identificar questionários não iniciados</li>
                    <li>• Alertar sobre prazos próximos do vencimento</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Resolução de Problemas Simples</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Problemas de Acesso</h4>
                      <p className="text-xs text-muted-foreground">
                        Ajudar com login, senhas esquecidas, orientações básicas
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Dúvidas Técnicas</h4>
                      <p className="text-xs text-muted-foreground">
                        Orientar sobre navegação, preenchimento de formulários
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quando Escalar</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Problemas técnicos complexos</li>
                    <li>• Questões médicas ou clínicas</li>
                    <li>• Alterações em protocolos</li>
                    <li>• Situações que requerem decisão clínica</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comunicação Efetiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Com Pacientes</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Tom Acolhedor</h4>
                      <p className="text-xs text-muted-foreground">
                        Use linguagem simples, seja paciente e empático
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Informações Claras</h4>
                      <p className="text-xs text-muted-foreground">
                        Explique processos de forma didática e objetiva
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Confidencialidade</h4>
                      <p className="text-xs text-muted-foreground">
                        Mantenha sigilo sobre informações pessoais e médicas
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Com a Equipe</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Reporte situações relevantes de forma objetiva</li>
                    <li>• Mantenha profissionais informados sobre status</li>
                    <li>• Comunique urgências imediatamente</li>
                    <li>• Documente interações importantes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Canais de Comunicação
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Email para questões não urgentes</li>
                    <li>• WhatsApp para lembretes e orientações</li>
                    <li>• Telefone para situações urgentes</li>
                    <li>• Sistema interno para atualizações</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tarefas e Responsabilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Gestão de Informações</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Manter dados de pacientes atualizados</li>
                    <li>• Organizar documentos digitais</li>
                    <li>• Verificar consistência das informações</li>
                    <li>• Preparar relatórios básicos quando solicitado</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Monitoramento de Atividades</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Questionários</h4>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                        <li>• Status de conclusão</li>
                        <li>• Prazos próximos</li>
                        <li>• Pacientes inativos</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Agendamentos</h4>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                        <li>• Confirmação de consultas</li>
                        <li>• Reagendamentos</li>
                        <li>• Preparação de materiais</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tarefas Administrativas</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Arquivar documentos concluídos</li>
                    <li>• Atualizar listas de contatos</li>
                    <li>• Preparar materiais para consultas</li>
                    <li>• Auxiliar em atividades especiais</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Ferramentas Úteis</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Lista de Pacientes</h4>
                      <p className="text-xs text-muted-foreground">
                        Para acompanhar status e atividades
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Dashboard</h4>
                      <p className="text-xs text-muted-foreground">
                        Visão geral das atividades do dia
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Relatórios Simples</h4>
                      <p className="text-xs text-muted-foreground">
                        Para acompanhar progresso e estatísticas
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Sistema de Notificações</h4>
                      <p className="text-xs text-muted-foreground">
                        Alertas automáticos sobre atividades
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpAssistant;