
import { useState, useCallback } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useToast } from '@/hooks/use-toast';

export interface FormSubmissionData {
  formId: string;
  patientId?: string;
  phoneNumber?: string;
  responses: Record<string, any>;
  completedAt: string;
}

export const useFormSubmission = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendMedia, isConnected } = useWhatsApp();
  const { toast } = useToast();

  const handleFormCompletion = useCallback(async (data: FormSubmissionData) => {
    if (!data.phoneNumber) {
      console.log('No phone number provided for WhatsApp notification');
      return;
    }

    setIsProcessing(true);

    try {
      // Simular processamento de conclusão
      console.log('Form completed:', data);

      // Enviar mídia automática via WhatsApp se conectado
      if (isConnected) {
        // Por enquanto, vamos simular o envio de um PDF
        const mediaUrl = '/sample-ebook.pdf'; // Placeholder
        
        await sendMedia(
          data.phoneNumber,
          mediaUrl,
          'document',
          `🎉 Parabéns por completar o formulário!\n\nAqui está seu conteúdo exclusivo como prometido.\n\n_Obrigado pela participação!_`
        );
      }

      toast({
        title: "Formulário concluído",
        description: isConnected 
          ? "Conteúdo enviado via WhatsApp automaticamente" 
          : "Resposta registrada com sucesso",
      });

    } catch (error) {
      console.error('Error processing form completion:', error);
      toast({
        title: "Erro no processamento",
        description: "Houve um problema ao processar a conclusão do formulário",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [sendMedia, isConnected, toast]);

  const triggerFormDistribution = useCallback(async (
    formId: string, 
    formName: string, 
    phoneNumber: string,
    customMessage?: string
  ) => {
    if (!isConnected) {
      toast({
        title: "WhatsApp não conectado",
        description: "Configure a conexão WhatsApp primeiro",
        variant: "destructive",
      });
      return false;
    }

    const formUrl = `${window.location.origin}/forms/${formId}`;
    
    const message = customMessage || 
      `📋 *${formName}*\n\nOlá! Você tem um novo formulário para preencher.\n\n🔗 Acesse aqui: ${formUrl}\n\n_Por favor, responda assim que possível._`;

    try {
      const result = await sendMedia(phoneNumber, '', 'text', message);
      return result.success;
    } catch (error) {
      console.error('Error sending form link:', error);
      return false;
    }
  }, [isConnected, sendMedia, toast]);

  return {
    isProcessing,
    handleFormCompletion,
    triggerFormDistribution,
  };
};
