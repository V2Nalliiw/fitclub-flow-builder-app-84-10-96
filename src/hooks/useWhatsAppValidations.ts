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
      console.log('🔍 Validando envio WhatsApp:', { phoneNumber, templateName, patientId });

      // 1. Verificar se o template está aprovado pela Meta
      const templateStatus = await checkTemplateApproval(templateName);
      console.log('📋 Status do template:', templateStatus);

      // 2. Verificar se está usando provider Meta
      const isUsingMeta = await checkIfUsingMetaProvider();
      console.log('🏢 Usando Meta API:', isUsingMeta);

      // 3. Validar número de telefone
      const phoneValidation = validatePhoneNumber(phoneNumber);
      console.log('📱 Validação do telefone:', phoneValidation);

      // 4. NOVA LÓGICA: Para templates aprovados pela Meta, não precisa de opt-in
      let requiresOptIn = true;
      let optInStatus = { hasOptIn: false };

      if (templateStatus.isApproved && isUsingMeta) {
        // Templates aprovados pela Meta podem ser enviados sem opt-in
        console.log('✅ Template aprovado pela Meta - dispensando opt-in');
        requiresOptIn = false;
        optInStatus.hasOptIn = true; // Simular opt-in para templates aprovados
      } else {
        // Para mensagens livres ou templates não aprovados, verificar opt-in
        console.log('⚠️ Template não aprovado ou não é Meta - verificando opt-in');
        optInStatus = await checkPatientOptIn(patientId, phoneNumber);
        requiresOptIn = !optInStatus.hasOptIn;
      }

      console.log('🔐 Status do opt-in:', { requiresOptIn, hasOptIn: optInStatus.hasOptIn });

      const result: WhatsAppValidationResult = {
        canSend: optInStatus.hasOptIn && phoneValidation.isValid,
        requiresOptIn: requiresOptIn,
        templateApproved: templateStatus.isApproved,
        reason: !phoneValidation.isValid
          ? 'Número de telefone inválido'
          : requiresOptIn && !optInStatus.hasOptIn
          ? 'Paciente não respondeu nas últimas 24h (opt-in necessário)'
          : !templateStatus.isApproved && !isUsingMeta
          ? `Template '${templateName}' não está aprovado para uso`
          : undefined
      };

      console.log('📊 Resultado da validação:', result);

      if (!result.canSend) {
        toast({
          title: "Envio WhatsApp Bloqueado",
          description: result.reason,
          variant: "destructive",
        });
      } else {
        console.log('🎉 Validação aprovada - pode enviar WhatsApp');
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

  const checkIfUsingMetaProvider = async () => {
    try {
      // Buscar configuração ativa de WhatsApp
      const { data: settings } = await supabase
        .from('whatsapp_settings')
        .select('provider, is_active')
        .eq('is_active', true)
        .limit(1)
        .single();

      const isUsingMeta = settings?.provider === 'meta';

      console.log('Check Meta provider:', { provider: settings?.provider, isUsingMeta });

      return isUsingMeta;
    } catch (error) {
      console.error('Erro ao verificar provider:', error);
      return false;
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