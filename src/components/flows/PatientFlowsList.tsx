
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatientFlows } from '@/hooks/usePatientFlows';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Play, 
  Calendar,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PatientFlowsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { executions, loading } = usePatientFlows();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Carregando seus formulários...</p>
        </div>
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full flex items-center justify-center mx-auto mb-6">
              <Workflow className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Nenhum formulário disponível
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Quando sua clínica atribuir formulários para você, eles aparecerão aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300';
      case 'in-progress':
        return 'bg-[#5D8701]/10 text-[#5D8701] dark:bg-[#5D8701]/20 dark:text-[#5D8701]';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Play className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in-progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      default:
        return 'Novo';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full mb-4 md:mb-6">
            <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            Meus Formulários
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Acesse seus formulários atribuídos e acompanhe seu progresso de tratamento.
          </p>
        </div>

        {/* Lista de Execuções */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {executions.map((execution) => (
            <Card 
              key={execution.id} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden cursor-pointer"
              onClick={() => navigate(`/flow-execution/${execution.id}`)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5D8701] to-[#4a6e01]"></div>
              
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg md:text-xl text-gray-900 dark:text-gray-100 group-hover:text-[#5D8701] transition-colors line-clamp-2">
                    {execution.flow_name}
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-[#5D8701] group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(execution.status)} flex items-center gap-1`}>
                    {getStatusIcon(execution.status)}
                    {getStatusText(execution.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>{execution.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${execution.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {execution.completed_steps} de {execution.total_steps} etapas concluídas
                  </div>
                </div>

                {/* Data de criação */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Iniciado {formatDistanceToNow(new Date(execution.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>

                {/* Próxima etapa disponível */}
                {execution.next_step_available_at && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      Próxima etapa em {formatDistanceToNow(new Date(execution.next_step_available_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/flow-execution/${execution.id}`);
                  }}
                >
                  {execution.status === 'completed' ? 'Ver Resultados' : 
                   execution.status === 'in-progress' ? 'Continuar' : 'Iniciar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
