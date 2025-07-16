import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

    // Gerar link para continuar o fluxo - usar URL da aplicação
    const continueLink = `https://oilnybhaboefqyhjrmvl.lovable.app/patient-dashboard?execution=${executionId}`;
    
    // Preparar mensagem
    const message = `🔔 *Novo Formulário Disponível!*\n\nOlá ${profile.name}! 🙋‍♀️\n\nSeu formulário "${formName}" está pronto para preenchimento.\n\n📝 Acesse aqui: ${continueLink}\n\n⏰ Complete quando puder!\n\nQualquer dúvida, entre em contato conosco! 😊`;

    let whatsappResponse;
    
    if (whatsappSettings.provider === 'meta') {
      console.log('📱 Enviando via Meta WhatsApp API...');
      
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