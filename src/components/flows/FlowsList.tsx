
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { useAuth } from '@/contexts/AuthContext';
import { CreateFlowDialog } from './CreateFlowDialog';
import { FlowAssignmentModal } from './FlowAssignmentModal';
import { Eye, Edit, Trash2, Play, UserPlus } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === 'patient' ? 'Fluxos Disponíveis' : 'Meus Fluxos'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'patient' 
              ? 'Fluxos de tratamento disponíveis para você'
              : 'Gerencie seus fluxos de tratamento'
            }
          </p>
        </div>
        
        {user?.role !== 'patient' && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Criar Novo Fluxo
          </Button>
        )}
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              {user?.role === 'patient' 
                ? 'Nenhum fluxo disponível no momento.'
                : 'Você ainda não criou nenhum fluxo.'
              }
            </p>
            {user?.role !== 'patient' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Criar Primeiro Fluxo
              </Button>
            )}
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
                  <p className="text-xs text-muted-foreground">
                    Criado {formatDistanceToNow(new Date(flow.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {user?.role === 'patient' ? (
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFlowDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <FlowAssignmentModal
        flow={assignmentFlow}
        isOpen={!!assignmentFlow}
        onClose={() => setAssignmentFlow(null)}
      />
    </div>
  );
};
