
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { CreateFlowDialog } from './CreateFlowDialog';
import { FlowAssignmentModal } from './FlowAssignmentModal';
import { Eye, Edit, Trash2, UserPlus, Plus, Workflow, RefreshCw, Activity, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ClinicFlowsList = () => {
  const { flows, isLoading, hasLoadedOnce, isEmpty, refreshFlows, deleteFlow } = useFlows();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [assignmentFlow, setAssignmentFlow] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando fluxos...</p>
      </div>
    );
  }

  if (!hasLoadedOnce || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-[#0E0E0E] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <div className="bg-white dark:bg-none dark:bg-[#0E0E0E] rounded-xl border border-gray-200 dark:border-[#1A1A1A] p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Meus Fluxos</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-base md:text-lg">
                  Crie e gerencie seus fluxos de tratamento e formulários para pacientes
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/flows')} 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Construtor de Fluxos
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="w-full sm:w-auto bg-[#5D8701] hover:bg-[#4a6e01] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Fluxo
                </Button>
              </div>
            </div>

            <div className="text-center py-12 md:py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Workflow className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Nenhum fluxo encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 md:mb-8 leading-relaxed">
                  Comece criando seu primeiro fluxo usando o construtor de fluxos.
                </p>
                <Button 
                  onClick={() => navigate('/flows')}
                  size="lg"
                  className="bg-[#5D8701] hover:bg-[#4a6e01] text-white px-6 md:px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Fluxo
                </Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-[#0E0E0E] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="bg-white dark:bg-none dark:bg-[#0E0E0E] rounded-xl border border-gray-200 dark:border-[#1A1A1A] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Meus Fluxos</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-base md:text-lg">
                Crie e gerencie seus fluxos de tratamento e formulários para pacientes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={refreshFlows}
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                onClick={() => navigate('/flows')} 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                Construtor de Fluxos
              </Button>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="w-full sm:w-auto bg-[#5D8701] hover:bg-[#4a6e01] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Fluxo
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-none dark:bg-[#0E0E0E]">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-[#5D8701] transition-colors line-clamp-1">
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
                      <Activity className="h-4 w-4 text-[#5D8701]" />
                      <span className="text-gray-500 dark:text-gray-500">Etapas:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{flow.nodes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#5D8701]" />
                      <span className="text-gray-500 dark:text-gray-500">Conexões:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{flow.edges?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-[#1A1A1A]">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Criado {formatDistanceToNow(new Date(flow.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/flows?edit=${flow.id}`)}
                        className="p-2 h-9"
                        title="Ver fluxo"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/flows?edit=${flow.id}`)}
                        className="p-2 h-9"
                        title="Editar fluxo"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAssignmentFlow(flow)}
                        className="p-2 h-9"
                        title="Atribuir fluxo"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFlow(flow.id)}
                        className="p-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        title="Deletar fluxo"
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
