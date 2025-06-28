
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
      // Salvar resposta do formulário
      const { error: responseError } = await supabase
        .from('form_responses')
        .insert({
          execution_id: executionId,
          node_id: nodeId,
          patient_id: (await supabase.auth.getUser()).data.user?.id,
          response: formData,
        });

      if (responseError) {
        throw responseError;
      }

      // Marcar step como concluído
      const { error: stepError } = await supabase
        .from('flow_steps')
        .update({
          status: 'concluido',
          completed_at: new Date().toISOString(),
          response: formData,
        })
        .eq('execution_id', executionId)
        .eq('node_id', nodeId);

      if (stepError) {
        throw stepError;
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
