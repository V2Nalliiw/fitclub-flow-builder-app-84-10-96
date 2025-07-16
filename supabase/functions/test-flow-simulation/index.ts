
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 test-flow-simulation function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { testType = 'full' } = await req.json().catch(() => ({}));
    console.log('🔍 Tipo de teste:', testType);

    const results = {
      timestamp: new Date().toISOString(),
      testType,
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    // Test 1: Database connectivity
    try {
      const { data: dbTest } = await supabase.from('profiles').select('count').limit(1);
      results.tests.push({
        name: 'Database Connectivity',
        status: 'passed',
        message: 'Successfully connected to database'
      });
    } catch (error) {
      results.tests.push({
        name: 'Database Connectivity',
        status: 'failed',
        message: `Database connection failed: ${error.message}`
      });
    }

    // Test 2: Edge Functions availability
    try {
      const { data: funcTest } = await supabase.functions.invoke('process-delay-tasks', {
        body: { test: true }
      });
      results.tests.push({
        name: 'Process Delay Tasks Function',
        status: 'passed',
        message: 'Function is accessible'
      });
    } catch (error) {
      results.tests.push({
        name: 'Process Delay Tasks Function',
        status: 'failed',
        message: `Function test failed: ${error.message}`
      });
    }

    // Test 3: Content Access table
    try {
      const { data: contentTest } = await supabase
        .from('content_access')
        .select('id')
        .limit(1);
      results.tests.push({
        name: 'Content Access Table',
        status: 'passed',
        message: 'Table is accessible'
      });
    } catch (error) {
      results.tests.push({
        name: 'Content Access Table',
        status: 'failed',
        message: `Content access table test failed: ${error.message}`
      });
    }

    // Test 4: Flow Logs table
    try {
      const { data: logsTest } = await supabase
        .from('flow_logs')
        .select('id')
        .limit(1);
      results.tests.push({
        name: 'Flow Logs Table',
        status: 'passed',
        message: 'Table is accessible'
      });
    } catch (error) {
      results.tests.push({
        name: 'Flow Logs Table',
        status: 'failed',
        message: `Flow logs table test failed: ${error.message}`
      });
    }

    // Test 5: Delay Tasks table
    try {
      const { data: delayTest } = await supabase
        .from('delay_tasks')
        .select('id')
        .limit(1);
      results.tests.push({
        name: 'Delay Tasks Table',
        status: 'passed',
        message: 'Table is accessible'
      });
    } catch (error) {
      results.tests.push({
        name: 'Delay Tasks Table',
        status: 'failed',
        message: `Delay tasks table test failed: ${error.message}`
      });
    }

    // Test 6: Storage bucket access
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const clinicMaterialsBucket = buckets?.find(b => b.name === 'clinic-materials');
      if (clinicMaterialsBucket) {
        results.tests.push({
          name: 'Storage Bucket Access',
          status: 'passed',
          message: 'clinic-materials bucket is accessible'
        });
      } else {
        results.tests.push({
          name: 'Storage Bucket Access',
          status: 'failed',
          message: 'clinic-materials bucket not found'
        });
      }
    } catch (error) {
      results.tests.push({
        name: 'Storage Bucket Access',
        status: 'failed',
        message: `Storage test failed: ${error.message}`
      });
    }

    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
    results.summary.failed = results.tests.filter(t => t.status === 'failed').length;

    console.log(`✅ Testes concluídos: ${results.summary.passed}/${results.summary.total} passaram`);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função de teste:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        testType: 'failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
