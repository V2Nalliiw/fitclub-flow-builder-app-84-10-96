import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCog, 
  Building2, 
  Settings, 
  Users, 
  BarChart3, 
  Shield,
  Database,
  Palette,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpSuperAdmin = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Building2, label: 'Gerenciar Clínicas', path: '/clinics' },
    { icon: Settings, label: 'Configurações Globais', path: '/settings' },
    { icon: Palette, label: 'Personalização', path: '/customization' },
    { icon: Shield, label: 'Permissões', path: '/permissions' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' }
  ];

  const features = [
    {
      title: 'Gerenciamento de Clínicas',
      description: 'Criar, editar e gerenciar todas as clínicas do sistema',
      items: [
        'Criar novas clínicas',
        'Configurar dados básicos (nome, endereço, contato)',
        'Ativar/desativar clínicas',
        'Monitorar estatísticas de uso'
      ]
    },
    {
      title: 'Configurações Globais',
      description: 'Controlar configurações que afetam todo o sistema',
      items: [
        'Configurar nome e logo do aplicativo',
        'Definir configurações de email',
        'Gerenciar templates de mensagens',
        'Configurar integrações globais'
      ]
    },
    {
      title: 'Controle de Permissões',
      description: 'Gerenciar papéis e permissões de usuários',
      items: [
        'Definir papéis customizados',
        'Configurar permissões granulares',
        'Auditar acessos e ações',
        'Gerenciar políticas de segurança'
      ]
    },
    {
      title: 'Analytics e Relatórios',
      description: 'Acessar dados e métricas de todo o sistema',
      items: [
        'Visualizar métricas globais',
        'Gerar relatórios por clínica',
        'Analisar padrões de uso',
        'Exportar dados para análise'
      ]
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white p-2 rounded-lg">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Super Administrador
            </h1>
            <p className="text-muted-foreground">
              Acesso completo a todas as funcionalidades do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades administrativas
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
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clinics">Clínicas</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Super Administrador</CardTitle>
              <CardDescription>
                Como super administrador, você tem acesso completo a todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gerenciamento de Clínicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Criar Nova Clínica</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse "Clínicas" no menu lateral</li>
                    <li>• Clique em "Nova Clínica"</li>
                    <li>• Preencha os dados básicos</li>
                    <li>• Configure o slug único (URL amigável)</li>
                    <li>• Ative a clínica para uso</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">2. Configurar Dados da Clínica</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Nome e descrição</li>
                    <li>• Logo personalizado</li>
                    <li>• Informações de contato</li>
                    <li>• Endereço completo</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Monitorar Atividade</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Visualizar estatísticas de uso</li>
                    <li>• Acompanhar número de usuários</li>
                    <li>• Monitorar fluxos ativos</li>
                    <li>• Gerar relatórios detalhados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personalização Global</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Nome do aplicativo</li>
                    <li>• Logo principal</li>
                    <li>• Cores e temas</li>
                    <li>• Templates de mensagens</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Integrações</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Configurações de WhatsApp globais</li>
                    <li>• Integração com sistemas externos</li>
                    <li>• APIs e webhooks</li>
                    <li>• Serviços de notificação</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Backup e Manutenção</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Configurar backups automáticos</li>
                    <li>• Logs do sistema</li>
                    <li>• Manutenção programada</li>
                    <li>• Monitoramento de performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança e Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Controle de Acesso</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Definir papéis customizados</li>
                    <li>• Configurar permissões granulares</li>
                    <li>• Gerenciar acessos por clínica</li>
                    <li>• Implementar políticas de senha</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Auditoria</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Logs de acesso</li>
                    <li>• Histórico de alterações</li>
                    <li>• Rastreamento de ações</li>
                    <li>• Relatórios de segurança</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Compliance</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• LGPD - Proteção de dados</li>
                    <li>• Termos de uso</li>
                    <li>• Políticas de privacidade</li>
                    <li>• Retenção de dados</li>
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

export default HelpSuperAdmin;