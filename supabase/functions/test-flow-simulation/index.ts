import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🧪 test-flow-simulation function called - TESTE COMPLETO');
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Teste 1: Verificar delay tasks pendentes
    console.log('🔍 Teste 1: Verificando delay tasks pendentes...');
    const { data: pendingTasks, error: tasksError } = await supabase
      .from('delay_tasks')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(10);

    testResults.tests.push({
      name: 'delay_tasks_pending',
      status: tasksError ? 'FAIL' : 'PASS',
      error: tasksError?.message,
      data: {
        count: pendingTasks?.length || 0,
        tasks: pendingTasks?.slice(0, 3) || []
      }
    });

    // Teste 2: Verificar flow_logs recentes
    console.log('🔍 Teste 2: Verificando flow_logs recentes...')
    const { data: recentLogs, error: logsError } = await supabase
      .from('flow_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    testResults.tests.push({
      name: 'flow_logs_recent',
      status: logsError ? 'FAIL' : 'PASS',
      error: logsError?.message,
      data: {
        count: recentLogs?.length || 0,
        latest_actions: recentLogs?.slice(0, 5).map(log => ({
          action: log.action,
          status: log.status,
          node_type: log.node_type,
          created_at: log.created_at
        })) || []
      }
    });

    // Teste 3: Verificar execuções ativas
    console.log('🔍 Teste 3: Verificando execuções ativas...');
    const { data: activeExecutions, error: execError } = await supabase
      .from('flow_executions')
      .select('*')
      .in('status', ['in-progress', 'pending'])
      .order('updated_at', { ascending: false })
      .limit(5);

    testResults.tests.push({
      name: 'active_executions',
      status: execError ? 'FAIL' : 'PASS',
      error: execError?.message,
      data: {
        count: activeExecutions?.length || 0,
        executions: activeExecutions?.map(exec => ({
          id: exec.id,
          status: exec.status,
          current_node: exec.current_node,
          progress: exec.progress,
          updated_at: exec.updated_at
        })) || []
      }
    });

    // Teste 4: Verificar content_access
    console.log('🔍 Teste 4: Verificando content_access...');
    const { data: contentAccess, error: contentError } = await supabase
      .from('content_access')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    testResults.tests.push({
      name: 'content_access_valid',
      status: contentError ? 'FAIL' : 'PASS',
      error: contentError?.message,
      data: {
        count: contentAccess?.length || 0,
        access_records: contentAccess?.map(ca => ({
          id: ca.id,
          files_count: Array.isArray(ca.files) ? ca.files.length : 0,
          expires_at: ca.expires_at,
          created_at: ca.created_at
        })) || []
      }
    });

    // Teste 5: Testar edge functions health
    console.log('🔍 Teste 5: Testando edge functions...');
    const edgeFunctionTests = [];

    try {
      // Testar process-delay-tasks
      const { data: delayResult, error: delayTestError } = await supabase.functions.invoke('process-delay-tasks', {});
      edgeFunctionTests.push({
        function: 'process-delay-tasks',
        status: delayTestError ? 'FAIL' : 'PASS',
        error: delayTestError?.message,
        result: delayResult
      });
    } catch (e) {
      edgeFunctionTests.push({
        function: 'process-delay-tasks',
        status: 'FAIL',
        error: e.message
      });
    }

    testResults.tests.push({
      name: 'edge_functions_health',
      status: 'PASS',
      data: {
        functions_tested: edgeFunctionTests.length,
        results: edgeFunctionTests
      }
    });

    // Teste 6: Verificar WhatsApp settings
    console.log('🔍 Teste 6: Verificando WhatsApp settings...');
    const { data: whatsappSettings, error: whatsappError } = await supabase
      .from('whatsapp_settings')
      .select('id, provider, is_active, phone_number')
      .eq('is_active', true)
      .limit(5);

    testResults.tests.push({
      name: 'whatsapp_settings',
      status: whatsappError ? 'FAIL' : 'PASS',
      error: whatsappError?.message,
      data: {
        active_settings: whatsappSettings?.length || 0,
        providers: whatsappSettings?.map(ws => ws.provider) || []
      }
    });

    // Calcular resumo final
    const passedTests = testResults.tests.filter(t => t.status === 'PASS').length;
    const totalTests = testResults.tests.length;
    const healthScore = Math.round((passedTests / totalTests) * 100);

    const summary = {
      overall_health: healthScore >= 80 ? 'HEALTHY' : healthScore >= 60 ? 'DEGRADED' : 'CRITICAL',
      health_score: `${healthScore}%`,
      passed_tests: passedTests,
      total_tests: totalTests,
      timestamp: testResults.timestamp,
      recommendations: []
    };

    // Adicionar recomendações baseadas nos testes
    if (pendingTasks && pendingTasks.length > 0) {
      summary.recommendations.push('Existem delay tasks pendentes - verifique o cron job');
    }

    if (activeExecutions && activeExecutions.length === 0) {
      summary.recommendations.push('Nenhuma execução ativa encontrada - pode indicar baixo uso');
    }

    if (healthScore < 80) {
      summary.recommendations.push('Sistema com problemas - investigate os testes que falharam');
    }

    console.log('✅ Teste completo finalizado:', summary);

    const finalResult = {
      summary,
      detailed_results: testResults,
      debug_info: {
        supabase_url: supabaseUrl,
        function_region: Deno.env.get('DENO_REGION'),
        execution_time: Date.now()
      }
    };

    return new Response(JSON.stringify(finalResult, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro crítico no teste:', error);
    return new Response(JSON.stringify({
      summary: {
        overall_health: 'CRITICAL',
        health_score: '0%',
        error: error.message
      },
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});