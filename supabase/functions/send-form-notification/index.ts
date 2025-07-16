
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 send-form-notification function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId, formName, executionId } = await req.json();
    console.log('📨 Request data:', { patientId, formName, executionId });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se a execução ainda está ativa (não completed)
    const { data: execution } = await supabase
      .from('flow_executions')
      .select('status')
      .eq('id', executionId)
      .single();
    
    if (execution?.status === 'completed') {
      console.log('⚠️ Execução já finalizada, não enviando WhatsApp');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Execução já finalizada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar dados do paciente
    const { data: patient } = await supabase
      .from('profiles')
      .select('name, phone, clinic_id')
      .eq('user_id', patientId)
      .single();

    if (!patient?.phone) {
      throw new Error('Paciente não encontrado ou sem telefone');
    }

    // Buscar configurações do WhatsApp da clínica
    const { data: whatsappConfig } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('clinic_id', patient.clinic_id)
      .eq('is_active', true)
      .single();

    if (!whatsappConfig) {
      console.log('❌ Configuração WhatsApp não encontrada para a clínica');
      throw new Error('WhatsApp não configurado para esta clínica');
    }

    const phoneNumber = patient.phone.replace(/\D/g, '');
    // 🔧 CORREÇÃO: Link direto para o formulário com executionId (vai direto para primeira pergunta)  
    const formUrl = `${req.headers.get('origin') || 'https://lovable.dev'}/flow-execution/${executionId}`;

    // Tentar template oficial primeiro
    console.log('🔄 Tentando template oficial novo_formulario...');
    
    const officialPayload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "novo_formulario",
        language: { code: "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: patient.name || "Paciente" },
              { type: "text", text: formName || "Formulário" }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              { type: "text", text: formUrl }
            ]
          }
        ]
      }
    };

    try {
      const officialResponse = await fetch(
        `https://graph.facebook.com/v17.0/${whatsappConfig.phone_number}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappConfig.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(officialPayload),
        }
      );
      
      if (officialResponse.ok) {
        const result = await officialResponse.json();
        console.log('✅ WhatsApp form notification sent successfully:', result);
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.log('❌ Template oficial falhou, tentando mensagem simples...');
    }

    // Fallback para mensagem de texto simples
    const simplePayload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: `Olá ${patient.name || 'Paciente'}! 👋\n\n📋 *${formName || 'Novo formulário'}* está disponível para preenchimento.\n\n🔗 Acesse aqui: ${formUrl}\n\n⏰ Preencha assim que possível.\n\nObrigado! 🙏`
      }
    };

    const simpleResponse = await fetch(
      `https://graph.facebook.com/v17.0/${whatsappConfig.phone_number}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappConfig.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload),
      }
    );

    if (simpleResponse.ok) {
      const result = await simpleResponse.json();
      console.log('✅ WhatsApp form notification sent successfully:', result);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const error = await simpleResponse.text();
      console.error('❌ Erro ao enviar mensagem simples:', error);
      throw new Error(`Falha no envio: ${error}`);
    }

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
