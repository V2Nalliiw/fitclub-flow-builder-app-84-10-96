import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Play, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { FlowStepRenderer } from '@/components/flows/FlowStepRenderer';

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
  next_step_available_at?: string;
}

const FlowExecution = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<FlowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!executionId || !user) return;

    const loadExecution = async () => {
      try {
        console.log('Loading execution with ID:', executionId);
        
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

        console.log('Execution loaded:', data);
        setExecution(data as FlowExecution);
        
        // Set current step index based on completed steps
        if (data.current_step && typeof data.current_step === 'object' && 'steps' in data.current_step) {
          const stepsData = data.current_step as { steps: any[] };
          const completedSteps = stepsData.steps.filter((step: any) => step.completed).length;
          setCurrentStepIndex(completedSteps);
        }
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

  const handleStepComplete = async (stepResponse: any) => {
    if (!execution || updating) return;

    setUpdating(true);
    try {
      // Safely extract steps from current_step
      const currentStepData = execution.current_step as { steps?: any[] } | null;
      const steps = currentStepData?.steps || [];
      const currentStep = steps[currentStepIndex];
      
      if (!currentStep) {
        toast.error('Etapa não encontrada');
        return;
      }

      // Update current step as completed
      const updatedSteps = steps.map((step: any, index: number) => {
        if (index === currentStepIndex) {
          return {
            ...step,
            completed: true,
            response: stepResponse,
            completed_at: new Date().toISOString()
          };
        }
        return step;
      });

      const completedCount = updatedSteps.filter((step: any) => step.completed).length;
      const newProgress = Math.round((completedCount / steps.length) * 100);
      const isCompleted = completedCount >= steps.length;

      // Find next available step
      let nextStepIndex = currentStepIndex + 1;
      let nextStep = null;
      let nextAvailableAt = null;

      if (nextStepIndex < steps.length) {
        nextStep = steps[nextStepIndex];
        nextAvailableAt = nextStep.availableAt;
        
        // Check if next step is available now
        const isNextStepAvailable = !nextAvailableAt || new Date(nextAvailableAt) <= new Date();
        
        if (!isNextStepAvailable) {
          // Step is delayed, show waiting message
          toast.info(`Próxima etapa estará disponível em ${new Date(nextAvailableAt).toLocaleString()}`);
        }
      }

      const updateData: any = {
        completed_steps: completedCount,
        progress: newProgress,
        updated_at: new Date().toISOString(),
        current_step: {
          ...currentStepData,
          steps: updatedSteps,
          currentStepIndex: isCompleted ? -1 : nextStepIndex
        }
      };

      if (isCompleted) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else if (nextStep && nextAvailableAt && new Date(nextAvailableAt) > new Date()) {
        updateData.status = 'waiting';
        updateData.next_step_available_at = nextAvailableAt;
      } else {
        updateData.status = 'pending';
      }

      const { data, error } = await supabase
        .from('flow_executions')
        .update(updateData)
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
      } else if (nextStep && (!nextAvailableAt || new Date(nextAvailableAt) <= new Date())) {
        setCurrentStepIndex(nextStepIndex);
        toast.success('Etapa concluída! Continuando...');
      } else {
        toast.success('Etapa concluída! Aguardando próxima etapa...');
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
  const currentStepData = execution.current_step as { steps?: any[] } | null;
  const steps = currentStepData?.steps || [];
  const currentStep = steps[currentStepIndex];
  const isWaiting = execution.status === 'waiting' && execution.next_step_available_at;

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
              Progresso: {execution.progress}% concluído ({execution.completed_steps} de {steps.length} etapas)
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progresso Geral</span>
                <span>{execution.completed_steps} de {steps.length} etapas</span>
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
              ) : isWaiting ? (
                <Clock className="h-6 w-6 text-orange-500" />
              ) : (
                <Play className="h-6 w-6 text-blue-500" />
              )}
              {isCompleted ? 'Fluxo Concluído!' : isWaiting ? 'Aguardando' : 'Etapa Atual'}
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
            ) : isWaiting ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Aguardando próxima etapa
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  A próxima etapa estará disponível em: {new Date(execution.next_step_available_at!).toLocaleString()}
                </p>
                <Button
                  onClick={() => navigate('/my-flows')}
                  variant="outline"
                >
                  Voltar aos Formulários
                </Button>
              </div>
            ) : currentStep ? (
              <FlowStepRenderer
                step={currentStep}
                onComplete={handleStepComplete}
                isLoading={updating}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhuma etapa disponível no momento.
                </p>
                <Button
                  onClick={() => navigate('/my-flows')}
                  variant="outline"
                  className="mt-4"
                >
                  Voltar aos Formulários
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowExecution;
