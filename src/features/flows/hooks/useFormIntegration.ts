
import { useState, useCallback } from 'react';
import { useFormManager } from '@/features/forms/hooks/useFormManager';
import { toast } from '@/hooks/use-toast';
import { Node } from '@xyflow/react';

export interface FormNodeData {
  formId?: string;
  formName?: string;
  formTitle?: string;
  formDescription?: string;
  autoSend?: boolean;
  redirectOnComplete?: boolean;
  redirectUrl?: string;
  sendToWhatsApp?: boolean;
  whatsAppMessage?: string;
}

export const useFormIntegration = () => {
  const { forms } = useFormManager();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});

  const getAvailableForms = useCallback(() => {
    return forms.filter(form => form.status === 'active');
  }, [forms]);

  const getFormById = useCallback((formId: string) => {
    return forms.find(form => form.id === formId);
  }, [forms]);

  const validateFormNode = useCallback((nodeData: FormNodeData) => {
    const errors: string[] = [];
    
    if (!nodeData.formId) {
      errors.push('Nenhum formulário selecionado');
    }
    
    const form = getFormById(nodeData.formId || '');
    if (!form) {
      errors.push('Formulário não encontrado');
    }
    
    if (nodeData.redirectOnComplete && !nodeData.redirectUrl) {
      errors.push('URL de redirecionamento não informada');
    }
    
    return errors;
  }, [getFormById]);

  const executeFormNode = useCallback(async (nodeId: string, nodeData: FormNodeData) => {
    const errors = validateFormNode(nodeData);
    if (errors.length > 0) {
      toast({
        title: "Erro na configuração",
        description: errors.join(', '),
        variant: "destructive",
      });
      return null;
    }

    setIsExecuting(true);
    
    try {
      const form = getFormById(nodeData.formId!);
      if (!form) {
        throw new Error('Formulário não encontrado');
      }

      // Simular execução do formulário
      const executionData = {
        nodeId,
        formId: nodeData.formId,
        formName: form.name,
        executedAt: new Date().toISOString(),
        status: 'pending',
        autoSend: nodeData.autoSend,
        whatsAppMessage: nodeData.whatsAppMessage,
      };

      // Armazenar resultado da execução
      setExecutionResults(prev => ({
        ...prev,
        [nodeId]: executionData
      }));

      // Simular envio para WhatsApp se configurado
      if (nodeData.sendToWhatsApp) {
        await simulateWhatsAppSend(nodeData.whatsAppMessage || `Formulário disponível: ${form.name}`);
      }

      toast({
        title: "Formulário executado",
        description: `O formulário "${form.name}" foi executado com sucesso.`,
      });

      return executionData;
    } catch (error) {
      toast({
        title: "Erro na execução",
        description: "Não foi possível executar o formulário.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [getFormById, validateFormNode]);

  const simulateWhatsAppSend = async (message: string) => {
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('WhatsApp message sent:', message);
  };

  const getExecutionResult = useCallback((nodeId: string) => {
    return executionResults[nodeId];
  }, [executionResults]);

  const clearExecutionResults = useCallback(() => {
    setExecutionResults({});
  }, []);

  const generateFormUrl = useCallback((formId: string) => {
    // Gerar URL do formulário baseado no ID
    return `${window.location.origin}/forms/${formId}`;
  }, []);

  const updateFormNodeData = useCallback((node: Node, formId: string): Partial<Node['data']> => {
    const form = getFormById(formId);
    if (!form) return {};

    return {
      formId,
      formName: form.name,
      formTitle: form.name,
      formDescription: form.description,
      autoSend: true,
      sendToWhatsApp: true,
      whatsAppMessage: `📋 Formulário disponível: ${form.name}\n\n${form.description || 'Clique no link para responder.'}\n\n🔗 ${generateFormUrl(formId)}`,
    };
  }, [getFormById, generateFormUrl]);

  return {
    // Estado
    isExecuting,
    executionResults,
    
    // Formulários
    getAvailableForms,
    getFormById,
    
    // Validação e execução
    validateFormNode,
    executeFormNode,
    getExecutionResult,
    clearExecutionResults,
    
    // Utilitários
    generateFormUrl,
    updateFormNodeData,
  };
};
