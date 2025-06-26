
import { useState, useCallback } from 'react';
import { useFormManager } from '@/features/forms/hooks/useFormManager';
import { useWhatsApp } from '@/hooks/useWhatsApp';
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
  mediaToSend?: {
    type: 'pdf' | 'image' | 'video' | 'document';
    url: string;
    name: string;
  };
}

export const useFormIntegration = () => {
  const { forms } = useFormManager();
  const { sendFormLink, sendMedia, isConnected } = useWhatsApp();
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

    if (nodeData.sendToWhatsApp && !isConnected) {
      errors.push('WhatsApp não está conectado');
    }
    
    return errors;
  }, [getFormById, isConnected]);

  const executeFormNode = useCallback(async (
    nodeId: string, 
    nodeData: FormNodeData, 
    patientPhone?: string
  ) => {
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

      // Dados da execução
      const executionData = {
        nodeId,
        formId: nodeData.formId,
        formName: form.name,
        executedAt: new Date().toISOString(),
        status: 'pending',
        autoSend: nodeData.autoSend,
        whatsAppSent: false,
      };

      // Enviar via WhatsApp se configurado e telefone disponível
      if (nodeData.sendToWhatsApp && patientPhone && isConnected) {
        const success = await sendFormLink(
          patientPhone,
          form.name,
          generateFormUrl(nodeData.formId!),
          nodeData.whatsAppMessage
        );

        executionData.whatsAppSent = success.success;
        
        if (success.success) {
          toast({
            title: "Formulário enviado",
            description: `Link enviado via WhatsApp para ${patientPhone}`,
          });
        }
      }

      // Armazenar resultado da execução
      setExecutionResults(prev => ({
        ...prev,
        [nodeId]: executionData
      }));

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
  }, [getFormById, validateFormNode, sendFormLink, isConnected]);

  const handleFormCompletion = useCallback(async (
    formId: string,
    patientPhone: string,
    responses: Record<string, any>
  ) => {
    // Encontrar nós que usam este formulário
    const relevantResults = Object.values(executionResults).filter(
      result => result.formId === formId
    );

    for (const result of relevantResults) {
      const nodeData = result.nodeData as FormNodeData;
      
      // Enviar mídia se configurado
      if (nodeData?.mediaToSend && patientPhone && isConnected) {
        try {
          await sendMedia(
            patientPhone,
            nodeData.mediaToSend.url,
            nodeData.mediaToSend.type,
            `🎉 Parabéns por completar o formulário!\n\nAqui está seu conteúdo exclusivo: ${nodeData.mediaToSend.name}\n\n_Obrigado pela participação!_`
          );
        } catch (error) {
          console.error('Error sending completion media:', error);
        }
      }
    }

    toast({
      title: "Formulário concluído",
      description: "Respostas registradas e conteúdo enviado automaticamente",
    });
  }, [executionResults, sendMedia, isConnected]);

  const getExecutionResult = useCallback((nodeId: string) => {
    return executionResults[nodeId];
  }, [executionResults]);

  const clearExecutionResults = useCallback(() => {
    setExecutionResults({});
  }, []);

  const generateFormUrl = useCallback((formId: string) => {
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
      whatsAppMessage: `📋 *${form.name}*\n\n${form.description || 'Clique no link para responder.'}\n\n🔗 ${generateFormUrl(formId)}`,
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
    handleFormCompletion,
    
    // Utilitários
    generateFormUrl,
    updateFormNodeData,
  };
};
