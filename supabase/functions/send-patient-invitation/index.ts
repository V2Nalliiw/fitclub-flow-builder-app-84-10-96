
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  name: string;
  email: string;
  phone?: string;
  invitationToken: string;
  expiresAt: string;
  clinicName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, invitationToken, expiresAt, clinicName }: InvitationRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create invitation link
    const invitationUrl = `${Deno.env.get('SITE_URL') || 'https://your-app.com'}/patient/register?token=${invitationToken}`;

    // Send email using Supabase Auth
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        invitation_token: invitationToken,
        patient_name: name,
        clinic_name: clinicName || 'Nossa Clínica',
        invitation_url: invitationUrl,
        expires_at: expiresAt,
        phone: phone,
      },
      redirectTo: invitationUrl,
    });

    if (emailError) {
      console.error('Erro ao enviar email:', emailError);
      throw emailError;
    }

    console.log('Email de convite enviado com sucesso para:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado por email com sucesso' 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro na função send-patient-invitation:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
