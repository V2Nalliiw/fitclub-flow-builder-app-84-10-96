import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'professional' | 'assistant' | 'viewer';
  permissions?: Record<string, boolean>;
  whatsapp_phone?: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Criar cliente Supabase com privilégios de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Criar cliente para usuário autenticado
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Não autorizado');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authorization }
        }
      }
    );

    // Verificar se o usuário atual tem permissão
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Obter dados do usuário criador
    const { data: creatorProfile, error: creatorError } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .single();

    if (creatorError || !creatorProfile?.clinic_id) {
      throw new Error('Não foi possível obter dados da clínica');
    }

    // Verificar permissões do criador
    if (creatorProfile.role !== 'clinic' && creatorProfile.role !== 'admin') {
      throw new Error('Sem permissão para criar usuários');
    }

    const { 
      email, 
      name, 
      role, 
      permissions = {}, 
      whatsapp_phone, 
      temporaryPassword 
    }: CreateUserRequest = await req.json();

    console.log('Criando usuário:', { email, name, role });

    // 1. Criar usuário no Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name,
        role: 'clinic', // Todos os membros da equipe são tipo 'clinic'
        temporary_password: true, // Flag para forçar mudança de senha
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError);
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log('Usuário criado no Auth:', authUser.user.id);

    // 2. Criar perfil do usuário
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        email,
        name,
        role: 'clinic', // Tipo de usuário
        clinic_id: creatorProfile.clinic_id,
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhar, deletar usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    console.log('Perfil criado');

    // 3. Criar membro da equipe
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        clinic_id: creatorProfile.clinic_id,
        user_id: authUser.user.id,
        role,
        permissions,
        whatsapp_phone,
        invited_by: user.id,
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Erro ao criar membro da equipe:', memberError);
      // Se falhar, deletar usuário e perfil
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', authUser.user.id);
      throw new Error(`Erro ao criar membro da equipe: ${memberError.message}`);
    }

    console.log('Membro da equipe criado');

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authUser.user.id,
        message: 'Usuário criado com sucesso'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Erro na função create-team-user:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);