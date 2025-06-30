
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface FlowExecution {
  id: string;
  flow_id: string;
  flow_name: string;
  patient_id: string;
  status: string;
  current_node: string;
  progress: number;
  total_steps: number;
  completed_steps: number;
  current_step: any;
  created_at: string;
  updated_at: string;
}

const FlowExecution = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<FlowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!executionId || !user) return;

    const loadExecution = async () => {
      try {
        const { data, error } = await supabase
          .from('flow_executions')
          .select('*')
          .eq('id', executionId)
          .eq('patient_id', user.id)
          .single();

        if (error || !data) {
          console.error('Erro ao carregar execução:', error);
          toast.error('Execução não encontrada');
          navigate('/my-flows');
          return;
        }

        setExecution(data as FlowExecution);
      } catch (error) {
        console.error('Erro ao carregar execução:', error);
        toast.error('Erro ao carregar execução');
        navigate('/my-flows');
      } finally {
        setLoading(false);
      }
    };

    loadExecution();
  }, [executionId, user, navigate]);

  const handleCompleteStep = async () => {
    if (!execution || updating) return;

    setUpdating(true);
    try {
      const newCompletedSteps = execution.completed_steps + 1;
      const newProgress = Math.min(100, Math.round((newCompletedSteps / execution.total_steps) * 100));
      const isCompleted = newProgress >= 100;

      const { data, error } = await supabase
        .from('flow_executions')
        .update({
          completed_steps: newCompletedSteps,
          progress: newProgress,
          status: isCompleted ? 'completed' : execution.status,
          completed_at: isCompleted ? new Date().toISOString() : null,
          current_step: {
            ...execution.current_step,
            completed: true,
            completed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', execution.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar execução:', error);
        toast.error('Erro ao salvar progresso');
        return;
      }

      setExecution(data as FlowExecution);
      
      if (isCompleted) {
        toast.success('Fluxo concluído com sucesso!');
        setTimeout(() => navigate('/my-flows'), 2000);
      } else {
        toast.success('Etapa concluída!');
      }
    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast.error('Erro ao completar etapa');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando formulário...</p>
      </div>
    );
  }

  if (!execution) {
    return null;
  }

  const isCompleted = execution.status === 'completed' || execution.progress >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-flows')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {execution.flow_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Progresso: {execution.progress}% concluído
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progresso Geral</span>
                <span>{execution.completed_steps} de {execution.total_steps} etapas</span>
              </div>
              <Progress value={execution.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Play className="h-6 w-6 text-blue-500" />
              )}
              {isCompleted ? 'Fluxo Concluído!' : 'Etapa Atual'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isCompleted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Parabéns!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Você concluiu todos os formulários com sucesso.
                </p>
                <Button
                  onClick={() => navigate('/my-flows')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Voltar aos Formulários
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {execution.current_step?.title || 'Próxima Etapa'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {execution.current_step?.description || 'Continue para a próxima etapa do seu formulário.'}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleCompleteStep}
                    disabled={updating}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg"
                    size="lg"
                  >
                    {updating ? (
                      <>
                        <LoadingSpinner className="mr-2 h-5 w-5" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Completar Etapa
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowExecution;
