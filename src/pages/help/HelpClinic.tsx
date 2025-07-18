import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Workflow, 
  MessagesSquare, 
  BarChart3,
  Settings,
  ArrowLeft,
  CheckCircle,
  Play,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpClinic = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Users, label: 'Gerenciar Pacientes', path: '/patients' },
    { icon: Workflow, label: 'Criar Fluxos', path: '/flows' },
    { icon: Users, label: 'Equipe', path: '/team' },
    { icon: MessagesSquare, label: 'WhatsApp', path: '/whatsapp-settings' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia da Clínica
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua clínica, equipe e pacientes de forma eficiente
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades da sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
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
      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="getting-started">Início</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primeiros Passos</CardTitle>
              <CardDescription>
                Configure sua clínica e comece a usar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold">Configure o Perfil da Clínica</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesse "Configurações" e complete os dados da sua clínica: nome, logo, contatos e endereço.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold">Convide Sua Equipe</h3>
                    <p className="text-sm text-muted-foreground">
                      Em "Equipe", convide profissionais e defina suas permissões: administradores, profissionais, assistentes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold">Configure o WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure a integração com WhatsApp para enviar mensagens automáticas aos pacientes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h3 className="font-semibold">Crie Seu Primeiro Fluxo</h3>
                    <p className="text-sm text-muted-foreground">
                      Desenvolva questionários e protocolos automatizados para seus pacientes.
                    </p>
                  </div>
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
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Convidar Pacientes
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse "Pacientes" no menu</li>
                    <li>• Clique em "Convidar Paciente"</li>
                    <li>• Preencha nome, email e telefone</li>
                    <li>• Escolha o método: convite por email ou criação direta</li>
                    <li>• O paciente receberá as credenciais de acesso</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Acompanhar Progresso</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Visualizar status dos fluxos atribuídos</li>
                    <li>• Acompanhar respostas em tempo real</li>
                    <li>• Exportar relatórios individuais</li>
                    <li>• Configurar notificações de progresso</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Atribuir Fluxos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Selecionar paciente na lista</li>
                    <li>• Escolher fluxo apropriado</li>
                    <li>• Definir prazo de conclusão</li>
                    <li>• Adicionar observações personalizadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Criação de Fluxos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Componentes</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Perguntas</h4>
                      <p className="text-xs text-muted-foreground">
                        Texto livre, múltipla escolha, escalas
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Calculadoras</h4>
                      <p className="text-xs text-muted-foreground">
                        Fórmulas automáticas e cálculos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Condições</h4>
                      <p className="text-xs text-muted-foreground">
                        Lógica condicional e ramificações
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Delays</h4>
                      <p className="text-xs text-muted-foreground">
                        Pausas programadas no fluxo
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Processo de Criação</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse "Construtor de Fluxos"</li>
                    <li>• Arraste componentes da barra lateral</li>
                    <li>• Configure cada componente individualmente</li>
                    <li>• Conecte os componentes com ligações</li>
                    <li>• Teste o fluxo antes de publicar</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Boas Práticas</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Mantenha fluxos simples e objetivos</li>
                    <li>• Use linguagem clara e acessível</li>
                    <li>• Teste com pacientes piloto</li>
                    <li>• Monitore taxas de abandono</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Papéis Disponíveis</h3>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-red-600">Administrador</h4>
                      <p className="text-xs text-muted-foreground">
                        Acesso total: gerenciar equipe, configurações, fluxos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-green-600">Gerente</h4>
                      <p className="text-xs text-muted-foreground">
                        Supervisão: pacientes, relatórios, fluxos limitados
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-purple-600">Profissional</h4>
                      <p className="text-xs text-muted-foreground">
                        Operacional: atender pacientes, executar protocolos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-orange-600">Assistente</h4>
                      <p className="text-xs text-muted-foreground">
                        Suporte: tarefas básicas e acompanhamento
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Adicionando Membros</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Escolha entre convite ou criação direta</li>
                    <li>• Defina o papel apropriado</li>
                    <li>• Configure permissões específicas</li>
                    <li>• Adicione informações de contato</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5" />
                Configuração do WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Configuração Inicial</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Obtenha API Key do provedor escolhido</li>
                    <li>• Configure webhook URL</li>
                    <li>• Teste conexão com número de teste</li>
                    <li>• Ative o serviço para uso</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Templates de Mensagem</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Criar templates personalizados</li>
                    <li>• Usar variáveis dinâmicas</li>
                    <li>• Configurar mensagens automáticas</li>
                    <li>• Testar antes de enviar</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Automação</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Lembretes de fluxos pendentes</li>
                    <li>• Notificações de conclusão</li>
                    <li>• Mensagens de boas-vindas</li>
                    <li>• Alertas personalizados</li>
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

export default HelpClinic;