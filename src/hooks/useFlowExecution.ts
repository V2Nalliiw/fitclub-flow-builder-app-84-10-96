
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFlowProcessor } from './useFlowProcessor';

interface FlowStep {
  nodeId: string;
  nodeType: string;
  title: string;
  description?: string;
  pergunta?: string;
  opcoes?: string[];
  tipoResposta?: string;
  tipoExibicao?: string;
  arquivo?: string;
  arquivos?: any[];
  mensagemFinal?: string;
  tipoConteudo?: string;
  delayAmount?: number;
  delayType?: string;
  calculatorFields?: any[];
  formula?: string;
  resultLabel?: string;
  conditions?: any[];
  calculatorResult?: number;
  nomenclatura?: string;
  prefixo?: string;
  sufixo?: string;
  tipoNumero?: string;
  operacao?: string;
  camposReferenciados?: string[];
  condicoesEspeciais?: any[];
  completed: boolean;
  response?: any;
  order: number;
  availableAt: string;
  canGoBack?: boolean;
}

export const useFlowExecution = (executionId: string) => {
  const { toast } = useToast();
  const { completeFlowStep, goBackToStep } = useFlowProcessor();
  const [execution, setExecution] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const fetchExecution = useCallback(async () => {
    if (!executionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (fetchError) {
        throw new Error('Execução não encontrada');
      }

      setExecution(data);

      // Parse current step data
      const currentStepData = data.current_step as {
        steps?: FlowStep[];
        currentStepIndex?: number;
      } | null;

      if (currentStepData?.steps && typeof currentStepData.currentStepIndex === 'number') {
        const steps = currentStepData.steps;
        const stepIndex = currentStepData.currentStepIndex;
        
        if (stepIndex >= 0 && stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setCanGoBack(stepIndex > 0);
        } else {
          setCurrentStep(null); // Flow completed
          setCanGoBack(false);
        }
      } else {
        setCurrentStep(null);
        setCanGoBack(false);
      }

    } catch (err) {
      console.error('Error fetching execution:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar execução');
    } finally {
      setIsLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    fetchExecution();
  }, [fetchExecution]);

  const completeStep = useCallback(async (response: any) => {
    if (!currentStep) return;

    try {
      await completeFlowStep(executionId, currentStep.nodeId, response);
      await fetchExecution(); // Refresh data
    } catch (error) {
      console.error('Error completing step:', error);
      throw error;
    }
  }, [currentStep, executionId, completeFlowStep, fetchExecution]);

  const goBack = useCallback(async () => {
    const currentStepData = execution?.current_step as {
      currentStepIndex?: number;
    } | null;

    if (currentStepData?.currentStepIndex && currentStepData.currentStepIndex > 0) {
      try {
        await goBackToStep(executionId, currentStepData.currentStepIndex - 1);
        await fetchExecution(); // Refresh data
      } catch (error) {
        console.error('Error going back:', error);
        throw error;
      }
    }
  }, [execution, executionId, goBackToStep, fetchExecution]);

  return {
    execution,
    currentStep,
    isLoading,
    error,
    completeStep,
    canGoBack,
    goBack
  };
};
