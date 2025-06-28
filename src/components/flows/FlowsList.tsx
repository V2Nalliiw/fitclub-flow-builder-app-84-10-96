
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { useAuth } from '@/contexts/AuthContext';
import { CreateFlowDialog } from './CreateFlowDialog';
import { FlowAssignmentModal } from './FlowAssignmentModal';
import { Eye, Edit, Trash2, Play, UserPlus, Plus, Workflow, ArrowRight, Calendar, Users, Activity, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const FlowsList = () => {
  const { flows, isLoading, hasLoadedOnce, isEmpty, refreshFlows, deleteFlow } = useFlows();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [assignmentFlow, setAssignmentFlow] = useState(null);

  // Auto-refresh quando o componente monta
  useEffect(() => {
    console.log('FlowsList montado, dados atuais:', { flows: flows.length, hasLoadedOnce, isEmpty });
    
    // Se não carregou ainda ou está vazio, tentar refresh
    if (!hasLoadedOnce || (hasLoadedOnce && isEmpty && flows.length === 0)) {
      console.log('Fazendo refresh automático dos fluxos...');
      refreshFlows();
    }
  }, []);

  // Mostrar loading apenas na primeira busca quando ainda não carregou
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando fluxos...</p>
      </div>
    );
  }

  // Se houve erro ou não há dados, mostrar interface simplificada
  if (!hasLoadedOnce || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meus Fluxos</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Crie e gerencie seus fluxos de tratamento e formulários para pacientes
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={refreshFlows}
                  variant="outline" 
                  size="lg"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => navigate('/flows')} 
                  variant="outline" 
                  size="lg"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Construtor de Fluxos
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Fluxo
                </Button>
              </div>
            </div>

            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Workflow className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {flows.length === 0 ? 'Nenhum fluxo encontrado' : 'Problemas de conexão detectados'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {flows.length === 0 
                    ? 'Comece criando seu primeiro fluxo usando o construtor de fluxos.'
                    : 'Há problemas temporários com a conexão ao banco de dados. Tente novamente ou acesse diretamente o construtor de fluxos.'
                  }
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/flows')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Primeiro Fluxo
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    ou tente atualizar a página
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CreateFlowDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />

          <FlowAssignmentModal
            flow={assignmentFlow}
            isOpen={!!assignmentFlow}
            onClose={() => setAssignmentFlow(null)}
          />
        </div>
      </div>
    );
  }

  // Interface para pacientes
  if (user?.role === 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <Workflow className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Dicas e Formulários
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Seus formulários diários e conteúdos personalizados para acompanhar seu tratamento
            </p>
          </div>

          {isEmpty ? (
            <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <Workflow className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Nenhum formulário disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                  Entre em contato com sua clínica para receber seus primeiros formulários e dicas personalizadas.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                    💡 Os formulários aparecerão aqui quando sua clínica criar um plano personalizado para você.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {flows.map((flow) => (
                <Card key={flow.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                          {flow.name}
                        </CardTitle>
                        {flow.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {flow.description}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={flow.is_active ? 'default' : 'secondary'}
                        className={flow.is_active ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200' : ''}
                      >
                        {flow.is_active ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {flow.nodes?.length || 0}
                        </div>
                        <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">Etapas</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {flow.nodes?.filter(n => n.type === 'formStart').length || 0}
                        </div>
                        <div className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">Formulários</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500">Progresso</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                        Disponível desde {formatDistanceToNow(new Date(flow.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 group"
                        size="lg"
                      >
                        <Play className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        Começar Formulários
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interface para clínicas - Página otimizada
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meus Fluxos</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Crie e gerencie seus fluxos de tratamento e formulários para pacientes
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={refreshFlows}
                variant="outline" 
                size="lg"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                onClick={() => navigate('/flows')} 
                variant="outline" 
                size="lg"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                <Eye className="h-4 w-4 mr-2" />
                Construtor de Fluxos
              </Button>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Fluxo
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                        {flow.name}
                      </CardTitle>
                      {flow.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {flow.description}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant={flow.is_active ? 'default' : 'secondary'}
                      className={flow.is_active ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : ''}
                    >
                      {flow.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-500 dark:text-gray-500">Etapas:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{flow.nodes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-gray-500 dark:text-gray-500">Conexões:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{flow.edges?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-500 dark:text-gray-500">Formulários:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {flow.nodes?.filter(n => n.type === 'formStart' || n.type === 'formSelect').length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-500 dark:text-gray-500">Delays:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{flow.nodes?.filter(n => n.type === 'delay').length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Criado {formatDistanceToNow(new Date(flow.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/flows?edit=${flow.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/flows?edit=${flow.id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAssignmentFlow(flow)}
                        className="flex-1"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Atribuir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFlow(flow.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <CreateFlowDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />

        <FlowAssignmentModal
          flow={assignmentFlow}
          isOpen={!!assignmentFlow}
          onClose={() => setAssignmentFlow(null)}
        />
      </div>
    </div>
  );
};
