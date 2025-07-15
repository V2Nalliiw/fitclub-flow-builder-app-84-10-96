import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log('🚀 send-form-notification function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { patientId, formName, executionId } = await req.json();
    console.log('📨 Request data:', { patientId, formName, executionId });

    if (!patientId || !formName || !executionId) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get patient and WhatsApp settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, clinic_id')
      .eq('user_id', patientId)
      .single();

    if (!profile?.phone) {
      console.error('❌ Patient phone not found');
      return new Response(
        JSON.stringify({ error: 'Patient phone not found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: whatsappSettings } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('is_active', true)
      .single();

    if (!whatsappSettings) {
      console.error('❌ WhatsApp settings not found');
      return new Response(
        JSON.stringify({ error: 'WhatsApp settings not configured' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate form link
    const formLink = `${supabaseUrl.replace('/rest/v1', '')}/functions/v1/serve-content?execution=${executionId}`;
    
    // Try to send using official template first, fallback to simple message
    let whatsappResponse;
    let templateSuccess = false;
    
    if (whatsappSettings.provider === 'meta') {
      console.log('🔄 Tentando template oficial novo_formulario...');
      
      // Try official template first
      try {
        const templateUrl = `https://graph.facebook.com/v17.0/${whatsappSettings.phone_number}/messages`;
        
        whatsappResponse = await fetch(templateUrl, {
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
                    { type: 'text', text: formName },
                    { type: 'text', text: formLink }
                  ]
                }
              ]
            }
          }),
        });

        if (whatsappResponse.ok) {
          templateSuccess = true;
          console.log('✅ Template oficial enviado com sucesso');
        } else {
          console.log('❌ Template oficial falhou, tentando mensagem simples...');
        }
      } catch (templateError) {
        console.log('❌ Erro no template oficial:', templateError);
      }

      // Fallback to simple message if template failed
      if (!templateSuccess) {
        const simpleMessage = `📋 *Novo Formulário Disponível!*\n\nOlá ${profile.name}! Você tem um novo formulário para preencher.\n\n📝 *${formName}*\n\n🔗 Acesse aqui: ${formLink}\n\n_Clique no link acima para iniciar o preenchimento._\n\nQualquer dúvida, entre em contato conosco! 😊`;
        
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
            text: { body: simpleMessage }
          }),
        });
      }
    } else if (whatsappSettings.provider === 'evolution') {
      const simpleMessage = `📋 *Novo Formulário Disponível!*\n\nOlá ${profile.name}! Você tem um novo formulário para preencher.\n\n📝 *${formName}*\n\n🔗 Acesse aqui: ${formLink}\n\n_Clique no link acima para iniciar o preenchimento._\n\nQualquer dúvida, entre em contato conosco! 😊`;
      
      const evolutionUrl = `${whatsappSettings.base_url}/message/sendText/${whatsappSettings.session_name}`;
      
      whatsappResponse = await fetch(evolutionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': whatsappSettings.api_key || '',
        },
        body: JSON.stringify({
          number: profile.phone,
          text: simpleMessage
        }),
      });
    } else {
      console.error('❌ Unsupported WhatsApp provider:', whatsappSettings.provider);
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
      console.error('❌ WhatsApp API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message', details: errorText }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const whatsappResult = await whatsappResponse.json();
    console.log('✅ WhatsApp form notification sent successfully:', whatsappResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        formLink,
        whatsappResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in send-form-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});