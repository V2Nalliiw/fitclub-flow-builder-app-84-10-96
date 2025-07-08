
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Play, Clock, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { FlowStepRenderer } from '@/components/flows/FlowStepRenderer';
import { DelayTimer } from '@/components/flows/DelayTimer';
import { useFlowProcessor } from '@/hooks/useFlowProcessor';

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
  const { completeFlowStep, goBackToStep } = useFlowProcessor();
  const [execution, setExecution] = useState<FlowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showStepNavigation, setShowStepNavigation] = useState(false);

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
        
        if (data.current_step && typeof data.current_step === 'object' && 'currentStepIndex' in data.current_step) {
          const stepsData = data.current_step as { steps: any[]; currentStepIndex?: number };
          const savedIndex = stepsData.currentStepIndex;
          
          if (typeof savedIndex === 'number' && savedIndex >= 0) {
            setCurrentStepIndex(savedIndex);
          } else {
            const firstIncompleteIndex = stepsData.steps.findIndex((step: any) => !step.completed);
            setCurrentStepIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
          }
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

    const interval = setInterval(loadExecution, 10000);
    return () => clearInterval(interval);
  }, [executionId, user, navigate]);

  const handleStepComplete = async (stepResponse: any) => {
    if (!execution || updating) return;

    setUpdating(true);
    try {
      const currentStepData = execution.current_step as { steps?: any[]; currentStepIndex?: number } | null;
      const steps = currentStepData?.steps || [];
      const currentStep = steps[currentStepIndex];
      
      if (!currentStep) {
        toast.error('Etapa não encontrada');
        return;
      }

      await completeFlowStep(execution.id, currentStep.nodeId, stepResponse);
      
      const { data: updatedExecution } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', execution.id)
        .single();

      if (updatedExecution) {
        setExecution(updatedExecution as FlowExecution);
        
        const updatedStepData = updatedExecution.current_step as { currentStepIndex?: number };
        if (typeof updatedStepData.currentStepIndex === 'number') {
          setCurrentStepIndex(updatedStepData.currentStepIndex);
        }

        if (updatedExecution.status === 'completed') {
          setTimeout(() => navigate('/my-flows'), 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao completar etapa:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleGoBack = async () => {
    if (!execution || currentStepIndex <= 0) return;

    const targetIndex = currentStepIndex - 1;
    try {
      await goBackToStep(execution.id, targetIndex);
      setCurrentStepIndex(targetIndex);
      
      // Reload execution
      const { data: updatedExecution } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', execution.id)
        .single();

      if (updatedExecution) {
        setExecution(updatedExecution as FlowExecution);
      }
    } catch (error) {
      console.error('Erro ao voltar etapa:', error);
    }
  };

  const handleStepNavigation = async (stepIndex: number) => {
    if (!execution) return;

    const currentStepData = execution.current_step as { steps?: any[] };
    const steps = currentStepData?.steps || [];
    const targetStep = steps[stepIndex];

    if (!targetStep || !targetStep.completed) {
      toast.error('Você só pode navegar para etapas já completadas');
      return;
    }

    try {
      await goBackToStep(execution.id, stepIndex);
      setCurrentStepIndex(stepIndex);
      setShowStepNavigation(false);

      // Reload execution
      const { data: updatedExecution } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', execution.id)
        .single();

      if (updatedExecution) {
        setExecution(updatedExecution as FlowExecution);
      }
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  const handleDelayExpired = () => {
    // Force reload execution to get updated status when delay expires
    if (executionId && user) {
      supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .eq('patient_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            // Check if delay has actually expired
            const now = new Date();
            const nextAvailable = data.next_step_available_at ? new Date(data.next_step_available_at) : null;
            
            if (!nextAvailable || now >= nextAvailable) {
              // Update status to active if delay expired
              supabase
                .from('flow_executions')
                .update({
                  status: 'in-progress', // Use valid status
                  next_step_available_at: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', executionId)
                .then(() => {
                  setExecution(prev => prev ? {...prev, status: 'in-progress', next_step_available_at: null} : null);
                  const updatedStepData = data.current_step as { currentStepIndex?: number };
                  if (typeof updatedStepData.currentStepIndex === 'number') {
                    setCurrentStepIndex(updatedStepData.currentStepIndex);
                  }
                  toast.success('Próximo formulário liberado!');
                });
            }
          }
        });
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
  const currentStepData = execution.current_step as { 
    steps?: any[]; 
    currentStepIndex?: number; 
    calculatorResults?: Record<string, number>;
  } | null;
  const steps = currentStepData?.steps || [];
  const currentStep = steps[currentStepIndex];
  const isWaiting = execution.status === 'pending' && execution.next_step_available_at;
  const completedSteps = steps.filter((step: any) => step.completed);

  // Get calculator result for conditions step
  const calculatorResults = currentStepData?.calculatorResults || {};
  const calculatorResult = currentStep?.calculatorResult || 
    Object.values(calculatorResults).pop() || 0;

  const delayExpired = execution.next_step_available_at ? 
    new Date() >= new Date(execution.next_step_available_at) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-[#0E0E0E] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
                {isWaiting && !delayExpired && ' • Aguardando próxima etapa'}
                {isWaiting && delayExpired && ' • Próxima etapa disponível!'}
              </p>
            </div>
          </div>
          
          {completedSteps.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowStepNavigation(!showStepNavigation)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Navegar Etapas
            </Button>
          )}
        </div>

        {/* Step Navigation */}
        {showStepNavigation && (
          <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Navegação por Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {steps.map((step: any, index: number) => (
                  <Button
                    key={step.nodeId}
                    variant={index === currentStepIndex ? "default" : step.completed ? "outline" : "ghost"}
                    disabled={!step.completed && index !== currentStepIndex}
                    onClick={() => handleStepNavigation(index)}
                    className="justify-start"
                  >
                    <span className="mr-2">
                      {step.completed ? '✅' : index === currentStepIndex ? '📍' : '⏳'}
                    </span>
                    Etapa {index + 1}: {step.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Delay Timer - Show when waiting and delay hasn't expired */}
        {isWaiting && execution.next_step_available_at && !delayExpired && (
          <DelayTimer
            availableAt={execution.next_step_available_at}
            onDelayExpired={handleDelayExpired}
          />
        )}

        {/* Current Step */}
        <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : isWaiting && !delayExpired ? (
                <Clock className="h-6 w-6 text-orange-500" />
              ) : (
                <Play className="h-6 w-6 text-primary" />
              )}
              {isCompleted ? 'Fluxo Concluído!' : 
               isWaiting && !delayExpired ? 'Aguardando Próxima Etapa' : 
               'Etapa Atual'}
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
            ) : currentStep && (!isWaiting || delayExpired) ? (
              <FlowStepRenderer
                step={currentStep}
                onComplete={handleStepComplete}
                isLoading={updating}
                calculatorResult={calculatorResult}
              />
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Etapa completada!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sua próxima etapa será liberada automaticamente no tempo programado.
                  Você pode fechar esta página e voltar depois.
                </p>
                <Button
                  onClick={() => navigate('/my-flows')}
                  variant="outline"
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
