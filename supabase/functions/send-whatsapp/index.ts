import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { phone, message } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Telefone e mensagem são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📱 send-whatsapp: Enviando mensagem para:', phone);

    // Buscar configurações do WhatsApp
    const { data: whatsappSettings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !whatsappSettings) {
      console.error('❌ send-whatsapp: Configuração WhatsApp não encontrada:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Configuração do WhatsApp não encontrada' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('⚙️ send-whatsapp: Usando provider:', whatsappSettings.provider);

    let sendResponse;

    switch (whatsappSettings.provider) {
      case 'meta':
        sendResponse = await sendMetaMessage(whatsappSettings, phone, message);
        break;
      case 'evolution':
        sendResponse = await sendEvolutionMessage(whatsappSettings, phone, message);
        break;
      case 'twilio':
        sendResponse = await sendTwilioMessage(whatsappSettings, phone, message);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Provedor de WhatsApp não suportado' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    return new Response(
      JSON.stringify(sendResponse),
      { 
        status: sendResponse.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ send-whatsapp: Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendMetaMessage(settings: any, phone: string, message: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${settings.business_account_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: message
          }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Meta API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Erro na API Meta'
      };
    }

    console.log('✅ Meta message sent:', data);
    return {
      success: true,
      messageId: data.messages?.[0]?.id
    };

  } catch (error) {
    console.error('❌ Meta send error:', error);
    return {
      success: false,
      error: 'Erro ao enviar via Meta'
    };
  }
}

async function sendEvolutionMessage(settings: any, phone: string, message: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const response = await fetch(
      `${settings.base_url}/message/sendText/${settings.session_name}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.api_key,
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Evolution API error:', data);
      return {
        success: false,
        error: data.message || 'Erro na API Evolution'
      };
    }

    console.log('✅ Evolution message sent:', data);
    return {
      success: true,
      messageId: data.key?.id
    };

  } catch (error) {
    console.error('❌ Evolution send error:', error);
    return {
      success: false,
      error: 'Erro ao enviar via Evolution'
    };
  }
}

async function sendTwilioMessage(settings: any, phone: string, message: string) {
  try {
    const auth = btoa(`${settings.account_sid}:${settings.auth_token}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${settings.phone_number}`,
          To: `whatsapp:${phone}`,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Twilio API error:', data);
      return {
        success: false,
        error: data.message || 'Erro na API Twilio'
      };
    }

    console.log('✅ Twilio message sent:', data);
    return {
      success: true,
      messageId: data.sid
    };

  } catch (error) {
    console.error('❌ Twilio send error:', error);
    return {
      success: false,
      error: 'Erro ao enviar via Twilio'
    };
  }
}