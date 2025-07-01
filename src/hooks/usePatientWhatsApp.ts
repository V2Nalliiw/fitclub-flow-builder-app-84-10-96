
import { useCallback } from 'react';
import { usePatients } from './usePatients';
import { useWhatsApp } from './useWhatsApp';
import { useToast } from '@/hooks/use-toast';

export const usePatientWhatsApp = () => {
  const { getPatientWhatsApp, isPatientWhatsAppVerified } = usePatients();
  const { sendFormLink, sendMessage, sendMedia } = useWhatsApp();
  const { toast } = useToast();

  const sendFormToPatient = useCallback(async (
    patientId: string,
    formName: string,
    formUrl: string,
    customMessage?: string
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

    if (!isPatientWhatsAppVerified(patientId)) {
      toast({
        title: "WhatsApp não verificado",
        description: "O WhatsApp deste paciente não foi verificado",
        variant: "destructive",
      });
      return { success: false, error: "WhatsApp não verificado" };
    }

    console.log(`Enviando formulário para paciente ${patientId} no WhatsApp: ${whatsappNumber}`);
    return await sendFormLink(whatsappNumber, formName, formUrl, customMessage);
  }, [getPatientWhatsApp, isPatientWhatsAppVerified, sendFormLink, toast]);

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
