import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔗 generate-patient-link function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { executionId, patientId } = await req.json();
    console.log('📝 Gerando link para execução:', { executionId, patientId });

    if (!executionId || !patientId) {
      console.error('❌ Parâmetros obrigatórios não fornecidos');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: executionId and patientId' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se a execução existe e pertence ao paciente
    const { data: execution, error: executionError } = await supabase
      .from('flow_executions')
      .select('id, patient_id, flow_name, status')
      .eq('id', executionId)
      .eq('patient_id', patientId)
      .single();

    if (executionError || !execution) {
      console.error('❌ Execução não encontrada ou não pertence ao paciente:', executionError);
      return new Response(
        JSON.stringify({ error: 'Execution not found or does not belong to patient' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se o paciente existe
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('user_id, name, clinic_id')
      .eq('user_id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('❌ Paciente não encontrado:', patientError);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar configurações do app para obter domínio personalizado
    const { data: appSettings } = await supabase
      .from('app_settings')
      .select('app_name')
      .single();
      
    // Gerar o link do paciente - usar domínio personalizado do FitClub
    const baseUrl = 'https://fitclub.app.br'; // Domínio personalizado do FitClub
    const patientLink = `${baseUrl}/patient-dashboard?execution=${executionId}`;
    
    console.log('🏥 App:', appSettings?.app_name || 'FitClub');
    
    console.log('✅ Link gerado:', patientLink);
    
    // Criar registro de acesso para auditoria (opcional)
    const accessData = {
      execution_id: executionId,
      patient_id: patientId,
      files: [], // Vazio por enquanto, pode ser usado para documentos no futuro
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      metadata: {
        generated_at: new Date().toISOString(),
        flow_name: execution.flow_name,
        patient_name: patient.name,
        clinic_id: patient.clinic_id
      }
    };

    const { data: contentAccess, error: accessError } = await supabase
      .from('content_access')
      .insert(accessData)
      .select('id, access_token')
      .single();

    if (accessError) {
      console.warn('⚠️ Erro ao criar registro de acesso (não crítico):', accessError);
    } else {
      console.log('✅ Registro de acesso criado:', contentAccess?.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        link: patientLink,
        executionId,
        patientId,
        flowName: execution.flow_name,
        patientName: patient.name,
        expiresAt: accessData.expires_at,
        accessToken: contentAccess?.access_token
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na função generate-patient-link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});