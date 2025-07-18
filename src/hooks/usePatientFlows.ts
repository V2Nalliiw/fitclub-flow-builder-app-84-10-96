
import { useState, useEffect, useCallback } from 'react';
import { PatientFlowExecution, PatientFlowStep } from '@/types/patient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFlowExecutionEngine } from '@/hooks/useFlowExecutionEngine';

export const usePatientFlows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { executeFlowStep } = useFlowExecutionEngine();
  const [executions, setExecutions] = useState<PatientFlowExecution[]>([]);
  const [steps, setSteps] = useState<PatientFlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  // ✨ REMOVER LÓGICA DUPLICADA - USAR APENAS useFlowExecutionEngine
  // O processamento de FormEnd agora é feito apenas no useFlowExecutionEngine.ts

  const loadPatientFlows = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: flowExecutions, error: flowError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (flowError) {
        console.error('Erro ao carregar execuções:', flowError);
        toast({
          title: "Erro ao carregar fluxos",
          description: "Não foi possível carregar seus fluxos",
          variant: "destructive",
        });
        return;
      }

      const transformedExecutions: PatientFlowExecution[] = (flowExecutions || []).map(execution => {
        // Map database status to frontend status
        let mappedStatus: 'em-andamento' | 'pausado' | 'concluido' | 'aguardando' = 'aguardando';
        switch (execution.status) {
          case 'in-progress':
            mappedStatus = 'em-andamento';
            break;
          case 'failed':
          case 'paused':
            mappedStatus = 'pausado';
            break;
          case 'completed':
            mappedStatus = 'concluido';
            break;
          case 'pending':
          default:
            // If it's pending but has steps and progress is 0, it should be active
            const currentStepData = execution.current_step as any;
            if (currentStepData?.steps && 
                Array.isArray(currentStepData.steps) && 
                currentStepData.steps.length > 0 &&
                execution.progress === 0) {
              mappedStatus = 'em-andamento';
            } else {
              mappedStatus = 'aguardando';
            }
            break;
        }

        const currentStepDataForLog = execution.current_step as any;
        console.log('usePatientFlows: Transforming execution:', {
          id: execution.id,
          originalStatus: execution.status,
          mappedStatus,
          progress: execution.progress,
          hasSteps: currentStepDataForLog?.steps?.length > 0
        });

        // Determinar o step atual baseado no currentStepIndex
        const currentStepData = execution.current_step as any;
        let currentStep = null;
        
        if (currentStepData?.steps && Array.isArray(currentStepData.steps)) {
          const currentStepIndex = currentStepData.currentStepIndex || 0;
          const currentStepInfo = currentStepData.steps[currentStepIndex];
          
          if (currentStepInfo) {
            currentStep = {
              type: currentStepInfo.nodeType,
              title: currentStepInfo.title,
              description: currentStepInfo.description,
              available_at: currentStepInfo.availableAt,
              completed: currentStepInfo.completed || false
            };
          }
        }

        // Garantir que completed_steps nunca exceda total_steps e recalcular progresso
        const rawCompletedSteps = execution.completed_steps || 0;
        const totalSteps = execution.total_steps || 1; // Evitar divisão por zero
        const safeCompletedSteps = Math.min(rawCompletedSteps, totalSteps);
        
        // Recalcular progresso baseado nos valores seguros
        const recalculatedProgress = totalSteps > 0 ? Math.round((safeCompletedSteps / totalSteps) * 100) : 0;
        const safeProgress = Math.min(recalculatedProgress, 100);

        console.log('🔧 usePatientFlows: Corrigindo progresso:', {
          executionId: execution.id,
          rawProgress: execution.progress,
          rawCompletedSteps,
          totalSteps,
          safeCompletedSteps,
          recalculatedProgress,
          safeProgress
        });

        return {
          id: execution.id,
          flow_id: execution.flow_id,
          flow_name: execution.flow_name,
          paciente_id: execution.patient_id,
          status: mappedStatus,
          no_atual: execution.current_node,
          progresso: safeProgress,
          started_at: execution.started_at,
          completed_at: execution.completed_at || undefined,
          next_step_available_at: execution.next_step_available_at || undefined,
          current_step: currentStep || { type: 'unknown', title: 'Carregando...', description: '' },
          total_steps: totalSteps,
          completed_steps: safeCompletedSteps,
        };
      });

      console.log('🔍 usePatientFlows: Execuções transformadas:', transformedExecutions.map(e => ({
        id: e.id,
        status: e.status,
        currentStepType: e.current_step?.type,
        currentStepTitle: e.current_step?.title,
        currentStepCompleted: e.current_step?.completed
      })));

      setExecutions(transformedExecutions);

      // Extract steps from execution metadata instead of separate table
      const transformedSteps: PatientFlowStep[] = [];
      flowExecutions.forEach(execution => {
        const currentStepData = execution.current_step as any;
        if (currentStepData?.steps) {
          currentStepData.steps.forEach((step: any) => {
            transformedSteps.push({
              id: `${execution.id}-${step.nodeId}`,
              execution_id: execution.id,
              node_id: step.nodeId,
              node_type: step.nodeType,
              title: step.title,
              description: step.description || undefined,
              status: step.completed ? 'concluido' : 'disponivel',
              completed_at: step.completed_at || undefined,
              available_at: step.availableAt || undefined,
              form_url: step.formId ? `/forms/${step.formId}?execution=${execution.id}` : undefined,
              response: step.response || undefined,
              // ✨ INCLUIR ARQUIVOS DO FORMEND
              arquivos: step.nodeType === 'formEnd' ? step.arquivos : undefined,
            });
          });
        }
      });
      
      setSteps(transformedSteps);

    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const completeStep = useCallback(async (executionId: string, stepId: string, response?: any) => {
    if (!user?.id) return;

    try {
      console.log('🔄 usePatientFlows: Iniciando completeStep', { executionId, stepId, response });

      const { data: execution, error: fetchError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (fetchError || !execution) {
        throw new Error('Execução não encontrada');
      }

      console.log('📊 usePatientFlows: Execução encontrada', { 
        currentStatus: execution.status,
        currentProgress: execution.progress,
        totalSteps: execution.total_steps,
        completedSteps: execution.completed_steps
      });

      // Garantir que completed_steps nunca exceda total_steps
      const safeNewCompletedSteps = Math.min(execution.completed_steps + 1, execution.total_steps);
      const newProgress = Math.min(Math.round((safeNewCompletedSteps / execution.total_steps) * 100), 100);
      const isFormCompleted = newProgress >= 100;
      const newStatus = isFormCompleted ? 'completed' : execution.status;

      console.log('📈 usePatientFlows: Calculando novo progresso', {
        safeNewCompletedSteps,
        newProgress,
        isFormCompleted,
        newStatus
      });

      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          completed_steps: safeNewCompletedSteps,
          progress: newProgress,
          status: newStatus,
          completed_at: isFormCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      // Store response in execution metadata if provided
      if (response && stepId) {
        const currentStepData = execution.current_step as any;
        const updatedStep = {
          ...currentStepData,
          response: response,
          completed: true,
          completed_at: new Date().toISOString()
        };

        await supabase
          .from('flow_executions')
          .update({
            current_step: updatedStep,
            updated_at: new Date().toISOString(),
          })
          .eq('id', executionId);
      }

      // ✨ NOVO: Verificar se chegamos ao nó FormEnd (independente do progresso)
      console.log('🔍 usePatientFlows: SEMPRE - Verificando current_step...', { 
        hasCurrentStep: !!execution.current_step,
        currentStepType: execution.current_step && typeof execution.current_step === 'object' && 'type' in execution.current_step ? (execution.current_step as any).type : 'N/A',
        currentStep: execution.current_step 
      });
      
      const currentStep = execution.current_step;
      if (currentStep && typeof currentStep === 'object' && 'type' in currentStep) {
        console.log('🎯 usePatientFlows: Current step tem type:', (currentStep as any).type);
        
        if ((currentStep as any).type === 'formEnd') {
          console.log('🎉 usePatientFlows: CHEGOU NO FORMEND! Processando imediatamente...');
          console.log('🎯 usePatientFlows: Dados de execução para FormEnd:', {
            executionId,
            flowId: execution.flow_id,
            progress: newProgress,
            status: newStatus,
            currentStep
          });
          
          // 🚀 EXECUTAR O FORMEND AGORA!
          try {
            await executeFlowStep(executionId, {
              nodeId: (currentStep as any).nodeId || 'formEnd',
              nodeType: 'formEnd',
              status: 'running'
            }, currentStep);
            console.log('✅ usePatientFlows: FormEnd processado com sucesso!');
          } catch (error) {
            console.error('❌ usePatientFlows: Erro ao processar FormEnd:', error);
          }
        } else {
          console.log('🔍 usePatientFlows: Tipo do nó atual não é formEnd:', (currentStep as any).type);
        }
      } else {
        console.log('🔍 usePatientFlows: Current step não é um objeto válido ou não tem type. Tipo:', typeof currentStep, 'Valor:', currentStep);
      }

      await loadPatientFlows();

      toast({
        title: "Etapa concluída",
        description: "Sua resposta foi registrada com sucesso",
      });

    } catch (error) {
      console.error('Erro ao completar etapa:', error);
      toast({
        title: "Erro ao completar etapa",
        description: "Não foi possível registrar sua resposta",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, loadPatientFlows, toast, executeFlowStep]);

  const getTimeUntilAvailable = useCallback((availableAt: string) => {
    const now = new Date();
    const available = new Date(availableAt);
    const diff = available.getTime() - now.getTime();
    
    if (diff <= 0) return 'Disponível agora';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Disponível em ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Disponível em ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Disponível em breve';
  }, []);

  useEffect(() => {
    if (user?.role === 'patient') {
      loadPatientFlows();
      
      // Configurar realtime updates para flow_executions
      const channel = supabase
        .channel('flow_executions_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escutar UPDATE, INSERT, DELETE
            schema: 'public',
            table: 'flow_executions',
            filter: `patient_id=eq.${user.id}` // Apenas para este paciente
          },
          (payload) => {
            console.log('🔄 Realtime update recebido:', payload);
            // Recarregar dados quando houver mudanças
            loadPatientFlows();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user, loadPatientFlows]);

  return {
    executions,
    steps,
    loading,
    completeStep,
    getTimeUntilAvailable,
    refetch: loadPatientFlows,
  };
};
