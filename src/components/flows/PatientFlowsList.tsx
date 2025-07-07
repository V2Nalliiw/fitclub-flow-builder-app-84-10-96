
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlowAssignments } from '@/hooks/useFlowAssignments';
import { Play, ArrowRight, Workflow, Activity, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const PatientFlowsList = () => {
  const { assignments, isLoading, startFlowExecution, isStarting } = useFlowAssignments();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch flow executions to get real progress data
  const { data: executions = [] } = useQuery({
    queryKey: ['flow-executions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar execuções:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  console.log('PatientFlowsList - Assignments:', assignments);
  console.log('PatientFlowsList - Executions:', executions);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando seus formulários...</p>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-6">
            <Workflow className="h-10 w-10 text-white" />
          </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Dicas e Formulários
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Seus formulários diários e conteúdos personalizados para acompanhar seu tratamento
            </p>
          </div>

        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-6">
              <Workflow className="h-12 w-12 text-white" />
            </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Nenhum formulário disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                Entre em contato com sua clínica para receber seus primeiros formulários e dicas personalizadas.
              </p>
            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 max-w-md">
              <p className="text-sm text-primary dark:text-primary text-center">
                💡 Os formulários aparecerão aqui quando sua clínica criar um plano personalizado para você.
              </p>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleStartFlow = async (assignment: any) => {
    console.log('Iniciando fluxo:', assignment);
    startFlowExecution({ 
      assignmentId: assignment.id, 
      flowId: assignment.flow_id 
    });
  };

  const getAssignmentWithExecution = (assignment: any) => {
    // Find the corresponding execution for this assignment
    const execution = executions.find(exec => exec.flow_id === assignment.flow_id);
    
    if (execution) {
      return {
        ...assignment,
        execution,
        actualStatus: execution.status,
        actualProgress: execution.progress || 0,
        isCompleted: execution.status === 'completed' || execution.progress >= 100,
      };
    }
    
    return {
      ...assignment,
      execution: null,
      actualStatus: assignment.status,
      actualProgress: 0,
      isCompleted: false,
    };
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary';
    }
    
    switch (status) {
      case 'assigned':
        return 'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground';
      case 'started':
      case 'pending':
        return 'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary';
      default:
        return 'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground';
    }
  };

  const getStatusText = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return 'Concluído';
    }
    
    switch (status) {
      case 'assigned':
        return 'Disponível';
      case 'started':
      case 'pending':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-6">
            <Workflow className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Seus Formulários
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {assignments.length} {assignments.length === 1 ? 'formulário disponível' : 'formulários disponíveis'} para você
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const assignmentWithExecution = getAssignmentWithExecution(assignment);
            const { actualStatus, actualProgress, isCompleted, execution } = assignmentWithExecution;
            
            return (
              <Card key={assignment.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-gradient"></div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                        {assignment.flow?.name || 'Formulário'}
                      </CardTitle>
                      {assignment.flow?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {assignment.flow.description}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(actualStatus, isCompleted)}
                    >
                      {getStatusText(actualStatus, isCompleted)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary dark:text-primary">
                        {assignment.flow?.nodes?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">Etapas</div>
                    </div>
                    <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary dark:text-primary">
                        {assignment.flow?.nodes?.filter((n: any) => n.type === 'formStart').length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">Formulários</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-500">Progresso</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {actualProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-primary-gradient h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${actualProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atribuído {formatDistanceToNow(new Date(assignment.assigned_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                    
                    {!execution && assignment.status === 'assigned' && (
                      <Button 
                        className="w-full bg-primary-gradient hover:opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-200 group"
                        size="lg"
                        onClick={() => handleStartFlow(assignment)}
                        disabled={isStarting || !assignment.flow?.is_active}
                      >
                        <Play className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        {isStarting ? 'Iniciando...' : 'Começar Formulários'}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}

                    {execution && !isCompleted && (
                      <Button 
                        className="w-full bg-primary-gradient hover:opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-200 group"
                        size="lg"
                        onClick={() => navigate(`/flow-execution/${execution.id}`)}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Continuar Formulários
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}

                    {isCompleted && (
                      <Button 
                        className="w-full bg-muted text-muted-foreground font-medium py-3 rounded-lg"
                        size="lg"
                        disabled
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Formulário Concluído
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
