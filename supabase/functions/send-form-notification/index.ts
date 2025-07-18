
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// WhatsApp Template Service implementation for Edge Function
class WhatsAppTemplateService {
  constructor(private supabase: any) {}

  async getTemplate(name: string, clinicId?: string) {
    console.log('🔍 Buscando template:', name, 'para clínica:', clinicId);
    
    try {
      // Primeiro tenta buscar template específico da clínica
      if (clinicId) {
        const { data: clinicTemplate, error: clinicError } = await this.supabase
          .from('whatsapp_templates')
          .select('*')
          .eq('name', name)
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .single();

        if (!clinicError && clinicTemplate) {
          console.log('✅ Template da clínica encontrado:', clinicTemplate);
          return clinicTemplate;
        }
      }

      // Se não encontrou template da clínica, busca template global
      const { data: globalTemplate, error: globalError } = await this.supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('name', name)
        .is('clinic_id', null)
        .eq('is_active', true)
        .single();

      if (globalError) {
        console.error('❌ Erro ao buscar template global:', globalError);
        return null;
      }

      console.log('✅ Template global encontrado:', globalTemplate);
      return globalTemplate;
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar template:', error);
      return null;
    }
  }

  async renderTemplate(templateName: string, variables: any, clinicId?: string): Promise<string> {
    console.log('🎨 Renderizando template:', templateName, 'com variáveis:', variables);
    
    const template = await this.getTemplate(templateName, clinicId);
    
    if (!template) {
      console.warn('⚠️ Template não encontrado, usando fallback');
      return this.getFallbackTemplate(templateName, variables);
    }

    let content = template.content;

    // Substituir placeholders pelas variáveis
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value as string);
    });

    // Verificar se restaram placeholders não substituídos
    const remainingPlaceholders = content.match(/\{[^}]+\}/g);
    if (remainingPlaceholders) {
      console.warn('⚠️ Placeholders não substituídos:', remainingPlaceholders);
    }

    console.log('✅ Template renderizado:', content);
    return content;
  }

  private getFallbackTemplate(templateName: string, variables: any): string {
    console.log('🔄 Usando template fallback para:', templateName);
    
    switch (templateName) {
      case 'novo_formulario':
        return `📋 *${variables.form_name || 'Formulário'}*\n\nOlá${variables.patient_name ? ` ${variables.patient_name}` : ''}! Você tem um formulário para preencher.\n\n🔗 Acesse o app: ${variables.form_url || 'https://fitclub.app.br'}\n\n_Responda assim que possível._`;
      
      default:
        return variables.message || 'Mensagem não disponível';
    }
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('📨 send-form-notification function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { patientId, formName, executionId } = await req.json();
    console.log('📨 Enviando notificação de formulário:', { patientId, formName, executionId });

    if (!patientId || !formName || !executionId) {
      console.error('❌ Parâmetros obrigatórios não fornecidos');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar dados do paciente
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, clinic_id')
      .eq('user_id', patientId)
      .single();

    if (!profile?.phone) {
      console.error('❌ Telefone do paciente não encontrado');
      return new Response(
        JSON.stringify({ error: 'Patient phone not found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar configurações do WhatsApp
    const { data: whatsappSettings } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('is_active', true)
      .single();

    if (!whatsappSettings) {
      console.error('❌ Configurações do WhatsApp não encontradas');
      return new Response(
        JSON.stringify({ error: 'WhatsApp settings not configured' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Dados coletados, enviando WhatsApp via', whatsappSettings.provider);

    // 🎯 SEMPRE usar o domínio fixo do FitClub
    const continueLink = 'https://fitclub.app.br/';
    
    // Inicializar o serviço de templates
    const templateService = new WhatsAppTemplateService(supabase);
    
    // Preparar variáveis do template
    const templateVariables = {
      patient_name: profile.name,
      form_name: formName,
      form_url: continueLink
    };
    
    // Renderizar mensagem usando template novo_formulario
    const message = await templateService.renderTemplate('novo_formulario', templateVariables, profile.clinic_id);
    
    console.log('📝 Mensagem renderizada:', message);

    let whatsappResponse;
    
    if (whatsappSettings.provider === 'meta') {
      console.log('📱 Enviando via Meta WhatsApp API usando template oficial...');
      
      // Primeiro tenta usar template oficial novo_formulario
      try {
        whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${whatsappSettings.phone_number}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappSettings.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: profile.phone,
            type: 'template',
            template: {
              name: 'novo_formulario',
              language: { code: 'pt_BR' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: profile.name },
                    { type: 'text', text: continueLink }
                  ]
                }
              ]
            }
          }),
        });

        console.log('✅ Template oficial novo_formulario enviado');
      } catch (templateError) {
        console.warn('⚠️ Falha no template oficial, usando fallback de texto:', templateError);
        
        // Fallback para mensagem de texto simples
        whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${whatsappSettings.phone_number}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappSettings.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: profile.phone,
            type: 'text',
            text: { body: message }
          }),
        });
      }
      
    } else if (whatsappSettings.provider === 'evolution') {
      console.log('📱 Enviando via Evolution API...');
      
      const evolutionUrl = `${whatsappSettings.base_url}/message/sendText/${whatsappSettings.session_name}`;
      
      whatsappResponse = await fetch(evolutionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': whatsappSettings.api_key || '',
        },
        body: JSON.stringify({
          number: profile.phone,
          text: message
        }),
      });
      
    } else {
      console.error('❌ Provedor de WhatsApp não suportado:', whatsappSettings.provider);
      return new Response(
        JSON.stringify({ error: 'Unsupported WhatsApp provider' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error('❌ Erro na API do WhatsApp:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message', details: errorText }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const whatsappResult = await whatsappResponse.json();
    console.log('✅ Mensagem WhatsApp enviada com sucesso:', whatsappResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form notification sent successfully',
        whatsappResult,
        patientName: profile.name,
        formName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na função send-form-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
