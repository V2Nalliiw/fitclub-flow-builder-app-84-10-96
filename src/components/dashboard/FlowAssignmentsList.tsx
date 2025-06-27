
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFlowAssignments } from '@/hooks/useFlowAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, Play, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FlowAssignmentsList = () => {
  const { assignments, isLoading, updateAssignmentStatus } = useFlowAssignments();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atribuições de Fluxos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atribuições de Fluxos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {user?.role === 'patient'
              ? 'Você não possui fluxos atribuídos ainda.'
              : 'Nenhuma atribuição de fluxo encontrada.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4" />;
      case 'started':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'secondary';
      case 'started':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'Atribuído';
      case 'started':
        return 'Iniciado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const canStartFlow = (assignment: any) => {
    return user?.role === 'patient' && assignment.status === 'assigned';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {user?.role === 'patient' ? 'Meus Fluxos Atribuídos' : 'Atribuições de Fluxos'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{assignment.flow?.name}</h4>
                  <Badge variant={getStatusColor(assignment.status) as any} className="flex items-center gap-1">
                    {getStatusIcon(assignment.status)}
                    {getStatusText(assignment.status)}
                  </Badge>
                </div>
                
                {user?.role !== 'patient' && assignment.patient && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Paciente: {assignment.patient.name}
                  </p>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Atribuído {formatDistanceToNow(new Date(assignment.assigned_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>

                {assignment.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{assignment.notes}"
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {canStartFlow(assignment) && (
                  <Button
                    size="sm"
                    onClick={() => updateAssignmentStatus({
                      assignmentId: assignment.id,
                      status: 'started'
                    })}
                  >
                    Iniciar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
