
import { useCallback } from 'react';
import { usePatients } from './usePatients';
import { useWhatsApp } from './useWhatsApp';
import { useToast } from '@/hooks/use-toast';

export const usePatientWhatsApp = () => {
  const { getPatientWhatsApp, isPatientWhatsAppVerified } = usePatients();
  const { sendFormLink, sendMessage, sendMedia, isConnected } = useWhatsApp();
  const { toast } = useToast();

  const sendFormToPatient = useCallback(async (
    patientId: string,
    formName: string,
    formUrl: string,
    customMessage?: string
  ) => {
    console.log('🚀 usePatientWhatsApp: Iniciando envio para paciente:', patientId);
    console.log('🔗 usePatientWhatsApp: WhatsApp conectado?', isConnected);
    
    // Verificar se WhatsApp está configurado primeiro
    if (!isConnected) {
      console.log('❌ usePatientWhatsApp: WhatsApp não conectado');
      toast({
        title: "WhatsApp não configurado",
        description: "Configure o WhatsApp antes de enviar mensagens",
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    const whatsappNumber = getPatientWhatsApp(patientId);
    console.log('📱 usePatientWhatsApp: Número do paciente:', whatsappNumber);
    
    if (!whatsappNumber) {
      toast({
        title: "WhatsApp não configurado",
        description: "Este paciente não possui WhatsApp configurado",
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    // Remover verificação restritiva que pode estar causando problemas
    // if (!isPatientWhatsAppVerified(patientId)) {
    //   toast({
    //     title: "WhatsApp não verificado",
    //     description: "O WhatsApp deste paciente não foi verificado",
    //     variant: "destructive",
    //   });
    //   return { success: false, error: "WhatsApp não verificado" };
    // }

    console.log(`✅ usePatientWhatsApp: Enviando formulário para paciente ${patientId} no WhatsApp: ${whatsappNumber}`);
    return await sendFormLink(whatsappNumber, formName, formUrl, customMessage);
  }, [getPatientWhatsApp, isPatientWhatsAppVerified, sendFormLink, toast, isConnected]);

  const sendMessageToPatient = useCallback(async (
    patientId: string,
    message: string
  ) => {
    const whatsappNumber = getPatientWhatsApp(patientId);
    
    if (!whatsappNumber) {
      toast({
        title: "WhatsApp não configurado",
        description: "Este paciente não possui WhatsApp configurado",
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    console.log(`Enviando mensagem para paciente ${patientId} no WhatsApp: ${whatsappNumber}`);
    return await sendMessage(whatsappNumber, message);
  }, [getPatientWhatsApp, sendMessage, toast]);

  const sendMediaToPatient = useCallback(async (
    patientId: string,
    mediaUrl: string,
    mediaType: string,
    message?: string
  ) => {
    const whatsappNumber = getPatientWhatsApp(patientId);
    
    if (!whatsappNumber) {
      toast({
        title: "WhatsApp não configurado",
        description: "Este paciente não possui WhatsApp configurado",
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não configurado" };
    }

    console.log(`Enviando mídia para paciente ${patientId} no WhatsApp: ${whatsappNumber}`);
    return await sendMedia(whatsappNumber, mediaUrl, mediaType, message);
  }, [getPatientWhatsApp, sendMedia, toast]);

  return {
    sendFormToPatient,
    sendMessageToPatient,
    sendMediaToPatient,
    getPatientWhatsApp,
    isPatientWhatsAppVerified,
  };
};
