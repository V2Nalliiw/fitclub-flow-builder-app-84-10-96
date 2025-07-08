import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppValidationResult {
  canSend: boolean;
  reason?: string;
  requiresOptIn?: boolean;
  templateApproved?: boolean;
}

export const useWhatsAppValidations = () => {
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const validateWhatsAppSending = useCallback(async (
    phoneNumber: string,
    templateName: string,
    patientId: string
  ): Promise<WhatsAppValidationResult> => {
    setValidating(true);

    try {
      console.log('Validando envio WhatsApp:', { phoneNumber, templateName, patientId });

      // 1. Verificar se o paciente já respondeu (opt-in) nas últimas 24h
      const optInStatus = await checkPatientOptIn(patientId, phoneNumber);
      
      // 2. Verificar se o template está aprovado
      const templateStatus = await checkTemplateApproval(templateName);

      // 3. Validar número de telefone
      const phoneValidation = validatePhoneNumber(phoneNumber);

      const result: WhatsAppValidationResult = {
        canSend: optInStatus.hasOptIn && templateStatus.isApproved && phoneValidation.isValid,
        requiresOptIn: !optInStatus.hasOptIn,
        templateApproved: templateStatus.isApproved,
        reason: !optInStatus.hasOptIn 
          ? 'Paciente não respondeu nas últimas 24h (opt-in necessário)'
          : !templateStatus.isApproved 
          ? `Template '${templateName}' não está aprovado pela Meta`
          : !phoneValidation.isValid
          ? 'Número de telefone inválido'
          : undefined
      };

      console.log('Resultado da validação:', result);

      if (!result.canSend) {
        toast({
          title: "Envio WhatsApp Bloqueado",
          description: result.reason,
          variant: "destructive",
        });
      }

      return result;

    } catch (error: any) {
      console.error('Erro na validação WhatsApp:', error);
      
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar envio WhatsApp",
        variant: "destructive",
      });

      return {
        canSend: false,
        reason: 'Erro na validação'
      };
    } finally {
      setValidating(false);
    }
  }, [toast]);

  const checkPatientOptIn = async (patientId: string, phoneNumber: string) => {
    // Verificar se há registro de resposta do paciente nas últimas 24h
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    try {
      // Buscar analytics de WhatsApp recebido do paciente
      const { data: recentActivity } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('user_id', patientId)
        .eq('event_type', 'whatsapp_received')
        .gte('created_at', last24h.toISOString())
        .limit(1);

      const hasOptIn = recentActivity && recentActivity.length > 0;

      console.log('Check opt-in:', { patientId, hasOptIn, last24h: last24h.toISOString() });

      return { hasOptIn };
    } catch (error) {
      console.error('Erro ao verificar opt-in:', error);
      return { hasOptIn: false };
    }
  };

  const checkTemplateApproval = async (templateName: string) => {
    try {
      // Buscar template no banco
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('is_official, is_active')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      const isApproved = template?.is_official === true;

      console.log('Check template approval:', { templateName, isApproved, template });

      return { isApproved };
    } catch (error) {
      console.error('Erro ao verificar template:', error);
      return { isApproved: false };
    }
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    // Validação básica de número brasileiro
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Número brasileiro: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
    const isValid = /^55\d{10,11}$/.test(cleanPhone);

    console.log('Phone validation:', { phoneNumber, cleanPhone, isValid });

    return { isValid };
  };

  const recordOptInActivity = useCallback(async (
    patientId: string,
    phoneNumber: string,
    eventType: 'whatsapp_sent' | 'whatsapp_received'
  ) => {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: patientId,
          event_type: eventType,
          event_data: {
            phone_number: phoneNumber,
            timestamp: new Date().toISOString(),
            source: 'flow_execution'
          }
        });

      console.log('Atividade WhatsApp registrada:', { patientId, eventType });
    } catch (error) {
      console.error('Erro ao registrar atividade WhatsApp:', error);
    }
  }, []);

  return {
    validateWhatsAppSending,
    recordOptInActivity,
    validating,
  };
};