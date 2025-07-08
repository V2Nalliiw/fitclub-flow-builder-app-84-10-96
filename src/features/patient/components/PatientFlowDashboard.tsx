
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  FileText, 
  AlertCircle,
  Calendar,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { usePatientFlows } from '@/hooks/usePatientFlows';
import { PatientFlowExecution } from '@/types/patient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'em-andamento':
      return <BookOpen className="h-4 w-4 text-primary" />;
    case 'aguardando':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'concluido':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pausado':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'em-andamento':
      return 'bg-primary/10 text-primary';
    case 'aguardando':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'concluido':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'pausado':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'em-andamento':
      return 'Disponível Hoje';
    case 'aguardando':
      return 'Próximo Formulário';
    case 'concluido':
      return 'Completado';
    case 'pausado':
      return 'Pausado';
    default:
      return 'Desconhecido';
  }
};

interface FlowCardProps {
  execution: PatientFlowExecution;
  onAction: (executionId: string, action: string) => void;
  getTimeUntilAvailable: (date: string) => string;
}

const FlowCard: React.FC<FlowCardProps> = ({ execution, onAction, getTimeUntilAvailable }) => {
  const canTakeAction = execution.status === 'em-andamento' && 
    (execution.current_step.type === 'formStart' || execution.current_step.type === 'question');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{execution.flow_name}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(execution.status)}
            <Badge className={getStatusColor(execution.status)}>
              {getStatusText(execution.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{execution.progresso}%</span>
          </div>
          <Progress value={execution.progresso} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {execution.completed_steps} de {execution.total_steps} formulários completados
          </div>
        </div>

        {/* Formulário Atual */}
        <div className="p-3 bg-secondary/50 rounded-lg">
          <div className="font-medium text-sm mb-1">
            {execution.status === 'em-andamento' ? 'Formulário de Hoje:' : 'Último Formulário:'}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {execution.current_step.title}
          </div>
          {execution.current_step.description && (
            <div className="text-xs text-muted-foreground">
              {execution.current_step.description}
            </div>
          )}
        </div>

        {/* Informações de Tempo */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Iniciado em {new Date(execution.started_at).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {execution.next_step_available_at && execution.status === 'aguardando' && (
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <Clock className="h-3 w-3" />
            <span>Próximo formulário {getTimeUntilAvailable(execution.next_step_available_at)}</span>
          </div>
        )}

        {/* Ações */}
        <div className="pt-2">
          {canTakeAction && (
            <Button 
              onClick={() => onAction(execution.id, 'continue')}
              className="w-full"
              size="sm"
            >
              {execution.current_step.type === 'formStart' ? 'Preencher Formulário' : 'Responder Pergunta'}
            </Button>
          )}
          
          {execution.status === 'concluido' && (
            <Button 
              variant="outline" 
              onClick={() => onAction(execution.id, 'view')}
              className="w-full"
              size="sm"
            >
              Ver Histórico
            </Button>
          )}
          
          {execution.status === 'aguardando' && (
            <Button variant="outline" className="w-full" size="sm" disabled>
              Aguardando Próximo Formulário
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const PatientFlowDashboard: React.FC = () => {
  const { executions, loading, completeStep, getTimeUntilAvailable } = usePatientFlows();

  const handleFlowAction = async (executionId: string, action: string) => {
    try {
      switch (action) {
        case 'continue':
          await completeStep(executionId, 'current_step');
          break;
        case 'view':
          console.log('Visualizar histórico do fluxo:', executionId);
          break;
        default:
          console.log('Ação não reconhecida:', action);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const todayForms = executions.filter(e => e.status === 'em-andamento');
  const waitingForms = executions.filter(e => e.status === 'aguardando');
  const completedForms = executions.filter(e => e.status === 'concluido');

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários Hoje</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayForms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingForms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedForms.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulários de Hoje */}
      {todayForms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Formulários de Hoje</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayForms.map((execution) => (
              <FlowCard
                key={execution.id}
                execution={execution}
                onAction={handleFlowAction}
                getTimeUntilAvailable={getTimeUntilAvailable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Próximos Formulários */}
      {waitingForms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Próximos Formulários</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waitingForms.map((execution) => (
              <FlowCard
                key={execution.id}
                execution={execution}
                onAction={handleFlowAction}
                getTimeUntilAvailable={getTimeUntilAvailable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Formulários Concluídos */}
      {completedForms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Formulários Concluídos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedForms.map((execution) => (
              <FlowCard
                key={execution.id}
                execution={execution}
                onAction={handleFlowAction}
                getTimeUntilAvailable={getTimeUntilAvailable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {executions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum formulário encontrado</h3>
            <p className="text-muted-foreground text-center">
              Você ainda não tem formulários disponíveis. Entre em contato com sua clínica para mais informações.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
