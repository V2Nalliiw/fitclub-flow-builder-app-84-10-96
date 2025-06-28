
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { useAuth } from '@/contexts/AuthContext';
import { CreateFlowDialog } from './CreateFlowDialog';
import { FlowAssignmentModal } from './FlowAssignmentModal';
import { Eye, Edit, Trash2, Play, UserPlus, Plus, Workflow, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const FlowsList = () => {
  const { flows, isLoading, deleteFlow } = useFlows();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [assignmentFlow, setAssignmentFlow] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando fluxos...</p>
      </div>
    );
  }

  if (user?.role === 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Dicas e Formulários</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seus formulários diários e conteúdos personalizados para acompanhar seu tratamento
            </p>
          </div>

          {flows.length === 0 ? (
            <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <Workflow className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Nenhum formulário disponível
                </h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Entre em contato com sua clínica para receber seus primeiros formulários e dicas personalizadas.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-blue-800 text-center">
                    💡 Os formulários aparecerão aqui quando sua clínica criar um plano personalizado para você.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {flows.map((flow) => (
                <Card key={flow.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                          {flow.name}
                        </CardTitle>
                        {flow.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {flow.description}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={flow.is_active ? 'default' : 'secondary'}
                        className={flow.is_active ? 'bg-green-100 text-green-800 border-green-200' : ''}
                      >
                        {flow.is_active ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {flow.nodes?.length || 0}
                        </div>
                        <div className="text-xs text-blue-800 font-medium">Etapas</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {flow.nodes?.filter(n => n.type === 'formStart').length || 0}
                        </div>
                        <div className="text-xs text-indigo-800 font-medium">Formulários</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progresso</span>
                        <span className="text-gray-700 font-medium">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-4">
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

  // Interface para clínicas/profissionais - Página de Overview antes do FlowBuilder
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Fluxos</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Crie e gerencie seus fluxos de tratamento e formulários para pacientes
              </p>
            </div>
            
            {flows.length > 0 && (
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/flows')} 
                  variant="outline" 
                  size="lg"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Construtor de Fluxos
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Fluxo
                </Button>
              </div>
            )}
          </div>

          {flows.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Workflow className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Crie seu primeiro fluxo
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Os fluxos permitem criar sequências de formulários e atividades que seus pacientes 
                  receberão ao longo dos dias. Comece criando seu primeiro fluxo.
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
                  <p className="text-sm text-gray-500">
                    Você será direcionado para o construtor de fluxos
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {flows.map((flow) => (
                <Card key={flow.id} className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-gray-900">{flow.name}</CardTitle>
                        {flow.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {flow.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={flow.is_active ? 'default' : 'secondary'}>
                        {flow.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nós:</span>
                        <span className="font-medium">{flow.nodes?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conexões:</span>
                        <span className="font-medium">{flow.edges?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Formulários:</span>
                        <span className="font-medium">
                          {flow.nodes?.filter(n => n.type === 'formStart' || n.type === 'formSelect').length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delays:</span>
                        <span className="font-medium">{flow.nodes?.filter(n => n.type === 'delay').length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-4">
                        Criado {formatDistanceToNow(new Date(flow.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setAssignmentFlow(flow)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFlow(flow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
