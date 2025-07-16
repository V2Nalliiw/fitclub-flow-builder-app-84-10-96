import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔗 generate-secure-download-link function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { patientId, executionId, files } = await req.json();
    console.log('📨 Request data:', { patientId, executionId, filesCount: files?.length });

    if (!patientId || !executionId || !files || files.length === 0) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create secure download link with 24h expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry for WhatsApp links

    const { data: contentAccess, error: contentError } = await supabase
      .from('content_access')
      .insert({
        execution_id: executionId,
        patient_id: patientId,
        files: files,
        expires_at: expiresAt.toISOString(),
        metadata: {
          created_for: 'whatsapp_download',
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })
      .select()
      .single();

    if (contentError || !contentAccess) {
      console.error('❌ Error creating content access:', contentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create secure link' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Secure download link created:', contentAccess.id);

    // Generate the secure download URL
    const secureDownloadUrl = `${supabaseUrl}/functions/v1/serve-content?token=${contentAccess.access_token}`;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        secureUrl: secureDownloadUrl,
        accessId: contentAccess.id,
        expiresAt: expiresAt.toISOString(),
        filesCount: files.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-secure-download-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});