
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { useAuth } from '@/contexts/AuthContext';
import { CreateFlowDialog } from './CreateFlowDialog';
import { FlowAssignmentModal } from './FlowAssignmentModal';
import { Eye, Edit, Trash2, Play, UserPlus, Plus, Workflow } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FlowsList = () => {
  const { flows, isLoading, deleteFlow } = useFlows();
  const { user } = useAuth();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dicas e Formulários</h1>
            <p className="text-muted-foreground mt-2">
              Seus formulários diários e conteúdos personalizados
            </p>
          </div>
        </div>

        {flows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Nenhum formulário disponível no momento.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Entre em contato com sua clínica para receber seus primeiros formulários e dicas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{flow.name}</CardTitle>
                      {flow.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {flow.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={flow.is_active ? 'default' : 'secondary'}>
                      {flow.is_active ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Etapas: {flow.nodes?.length || 0}</span>
                      <span>Formulários: {flow.nodes?.filter(n => n.type === 'formStart').length || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Disponível desde {formatDistanceToNow(new Date(flow.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Começar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Interface para clínicas/profissionais
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Fluxos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus fluxos de tratamento e formulários
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Crie seu primeiro fluxo</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Os fluxos permitem criar sequências de formulários e atividades que seus pacientes 
              receberão ao longo dos dias. Comece criando seu primeiro fluxo.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Card key={flow.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    {flow.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {flow.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={flow.is_active ? 'default' : 'secondary'}>
                    {flow.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Nós: {flow.nodes?.length || 0}</span>
                    <span>Conexões: {flow.edges?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Formulários: {flow.nodes?.filter(n => n.type === 'formStart' || n.type === 'formSelect').length || 0}</span>
                    <span>Delays: {flow.nodes?.filter(n => n.type === 'delay').length || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criado {formatDistanceToNow(new Date(flow.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
  );
};
