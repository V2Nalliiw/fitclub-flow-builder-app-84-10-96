
import { useState, useCallback } from 'react';
import { useFormManager } from '@/features/forms/hooks/useFormManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFormIntegration = () => {
  const { forms } = useFormManager();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getAvailableForms = useCallback(() => {
    return forms.filter(form => form.status === 'active');
  }, [forms]);

  const getFormById = useCallback((formId: string) => {
    return forms.find(form => form.id === formId);
  }, [forms]);

  const submitFormResponse = useCallback(async (
    executionId: string,
    nodeId: string,
    formData: Record<string, any>
  ) => {
    setLoading(true);
    
    try {
      // Store response in flow_executions metadata instead of separate table
      const { data: execution, error: fetchError } = await supabase
        .from('flow_executions')
        .select('current_step')
        .eq('id', executionId)
        .single();

      if (fetchError || !execution) {
        throw new Error('Execução não encontrada');
      }

      const currentStep = execution.current_step as any;
      const updatedStep = {
        ...currentStep,
        response: formData,
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Update the execution with the form response
      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          current_step: updatedStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', executionId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Formulário enviado",
        description: "Suas respostas foram registradas com sucesso",
      });

      return true;

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Não foi possível salvar suas respostas",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateFormUrl = useCallback((formId: string, executionId?: string) => {
    const baseUrl = `${window.location.origin}/forms/${formId}`;
    return executionId ? `${baseUrl}?execution=${executionId}` : baseUrl;
  }, []);

  return {
    loading,
    getAvailableForms,
    getFormById,
    submitFormResponse,
    generateFormUrl,
  };
};
