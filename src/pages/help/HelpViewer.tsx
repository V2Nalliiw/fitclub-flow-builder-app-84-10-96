import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  FileText, 
  BarChart3, 
  Search,
  ArrowLeft,
  Info,
  Download,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpViewer = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: FileText, label: 'Visualizar Dados', path: '/patients' },
    { icon: BarChart3, label: 'Relatórios', path: '/analytics' },
    { icon: Search, label: 'Buscar Informações', path: '/dashboard' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-gray-500 text-white p-2 rounded-lg">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Visualizador
            </h1>
            <p className="text-muted-foreground">
              Acesse e consulte informações sem permissões de edição
            </p>
          </div>
        </div>
      </div>

      {/* Aviso Importante */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Info className="h-5 w-5" />
            Importante - Acesso Somente Leitura
          </CardTitle>
          <CardDescription>
            Como visualizador, você pode consultar informações mas não pode fazer alterações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✓ Você pode:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Visualizar dados de pacientes autorizados</li>
                <li>• Consultar relatórios e estatísticas</li>
                <li>• Buscar e filtrar informações</li>
                <li>• Exportar dados quando permitido</li>
                <li>• Acessar dashboards informativos</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-red-600 mb-2">✗ Você não pode:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Editar informações de pacientes</li>
                <li>• Criar ou modificar questionários</li>
                <li>• Alterar configurações do sistema</li>
                <li>• Gerenciar usuários ou permissões</li>
                <li>• Excluir dados ou registros</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Suas Principais Atividades
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as informações que você pode consultar
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
          <TabsTrigger value="viewing">Visualização</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="tips">Dicas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Papel do Visualizador</CardTitle>
              <CardDescription>
                Como visualizador, você tem acesso controlado para consulta de informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold">Casos de Uso Típicos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Auditorias e revisões</li>
                    <li>• Consultas para relatórios externos</li>
                    <li>• Supervisão e acompanhamento</li>
                    <li>• Análise de dados para pesquisa</li>
                    <li>• Verificação de conformidade</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Limitações de Segurança</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesso baseado em permissões específicas</li>
                    <li>• Dados sensíveis podem estar ocultos</li>
                    <li>• Algumas seções podem não estar disponíveis</li>
                    <li>• Ações de modificação são bloqueadas</li>
                    <li>• Logs de acesso são registrados</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Transparência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acesso transparente a informações autorizadas
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Segurança</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Proteção rigorosa de dados sensíveis
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Conformidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Atendimento a requisitos regulatórios
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Navegação e Visualização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Áreas Acessíveis</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Dashboard</h4>
                      <p className="text-xs text-muted-foreground">
                        Visão geral com estatísticas e resumos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Lista de Pacientes</h4>
                      <p className="text-xs text-muted-foreground">
                        Informações básicas dos pacientes autorizados
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Relatórios</h4>
                      <p className="text-xs text-muted-foreground">
                        Relatórios pré-configurados e análises
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Analytics</h4>
                      <p className="text-xs text-muted-foreground">
                        Gráficos e métricas do sistema
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Ferramentas de Busca
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use filtros para encontrar informações específicas</li>
                    <li>• Combine múltiplos critérios de busca</li>
                    <li>• Salve buscas frequentes para acesso rápido</li>
                    <li>• Utilize ordenação para organizar resultados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Navegação Eficiente</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use o menu lateral para acesso rápido</li>
                    <li>• Marque páginas importantes como favoritas</li>
                    <li>• Utilize atalhos de teclado quando disponíveis</li>
                    <li>• Configure visualizações personalizadas</li>
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
                Relatórios e Análises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Relatórios Disponíveis</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Estatísticos</h4>
                      <p className="text-xs text-muted-foreground">
                        Métricas gerais, tendências, comparativos
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Operacionais</h4>
                      <p className="text-xs text-muted-foreground">
                        Atividades diárias, produtividade, volumes
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Analíticos</h4>
                      <p className="text-xs text-muted-foreground">
                        Análises profundas, correlações, insights
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Compliance</h4>
                      <p className="text-xs text-muted-foreground">
                        Conformidade, auditorias, regulamentações
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Personalizando Relatórios
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Defina períodos específicos para análise</li>
                    <li>• Aplique filtros por categoria, status, tipo</li>
                    <li>• Escolha métricas relevantes para seu objetivo</li>
                    <li>• Configure agrupamentos e ordenações</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportação de Dados
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Exporte relatórios em PDF para apresentações</li>
                    <li>• Use Excel para análises mais detalhadas</li>
                    <li>• Configure exportações automáticas quando permitido</li>
                    <li>• Respeite políticas de proteção de dados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Interpretação de Dados</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Observe tendências e padrões nos gráficos</li>
                    <li>• Compare períodos para identificar mudanças</li>
                    <li>• Use contexto clínico para interpretar números</li>
                    <li>• Documente insights importantes para a equipe</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Dicas e Boas Práticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Maximizando sua Eficiência</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Organização</h4>
                      <p className="text-xs text-muted-foreground">
                        Crie uma rotina de acesso e mantenha favoritos organizados
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Filtros Salvos</h4>
                      <p className="text-xs text-muted-foreground">
                        Configure e salve filtros para consultas frequentes
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Anotações</h4>
                      <p className="text-xs text-muted-foreground">
                        Mantenha anotações externas sobre insights importantes
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Ética e Responsabilidade</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Acesse apenas informações necessárias para seu trabalho</li>
                    <li>• Mantenha absoluto sigilo sobre dados pessoais</li>
                    <li>• Não compartilhe credenciais de acesso</li>
                    <li>• Reporte suspeitas de uso inadequado</li>
                    <li>• Siga políticas de proteção de dados da organização</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Solução de Problemas</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Não consigo ver determinadas informações:</h4>
                    <p className="text-xs text-muted-foreground ml-4">
                      Suas permissões podem ser limitadas. Entre em contato com o administrador.
                    </p>
                    
                    <h4 className="font-medium text-sm">Relatórios não carregam:</h4>
                    <p className="text-xs text-muted-foreground ml-4">
                      Verifique sua conexão e tente novamente. Pode ser um problema temporário.
                    </p>
                    
                    <h4 className="font-medium text-sm">Dados parecem incorretos:</h4>
                    <p className="text-xs text-muted-foreground ml-4">
                      Verifique filtros aplicados e período selecionado antes de reportar problemas.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contato e Suporte</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Para dúvidas técnicas: Entre em contato com o suporte</li>
                    <li>• Para questões de acesso: Fale com seu supervisor</li>
                    <li>• Para esclarecimentos sobre dados: Consulte a equipe clínica</li>
                    <li>• Para relatórios especiais: Solicite ao administrador</li>
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

export default HelpViewer;