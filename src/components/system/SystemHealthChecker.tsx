
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  User,
  Database,
  Upload,
  Navigation,
  FileText,
  Settings,
  Users,
  GitBranch
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  icon: React.ReactNode;
  details?: string;
}

export const SystemHealthChecker = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runHealthChecks = async () => {
    setIsRunning(true);
    const healthChecks: HealthCheck[] = [];

    // 1. Teste de Autenticação
    healthChecks.push({
      name: 'Sistema de Autenticação',
      status: user ? 'success' : 'error',
      message: user ? `Usuário autenticado: ${user.name} (${user.role})` : 'Usuário não autenticado',
      icon: <User className="h-4 w-4" />,
      details: user ? `Email: ${user.email}, ID: ${user.id}` : undefined
    });

    // 2. Teste de Conexão Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      healthChecks.push({
        name: 'Conexão Supabase',
        status: error ? 'error' : 'success',
        message: error ? `Erro: ${error.message}` : 'Conexão estabelecida com sucesso',
        icon: <Database className="h-4 w-4" />,
        details: error ? undefined : 'Database respondendo normalmente'
      });
    } catch (error) {
      healthChecks.push({
        name: 'Conexão Supabase',
        status: 'error',
        message: 'Falha na conexão com o banco de dados',
        icon: <Database className="h-4 w-4" />
      });
    }

    // 3. Teste de Perfil do Usuário
    if (user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        healthChecks.push({
          name: 'Perfil do Usuário',
          status: error ? 'error' : 'success',
          message: error ? `Erro ao carregar perfil: ${error.message}` : 'Perfil carregado com sucesso',
          icon: <User className="h-4 w-4" />,
          details: profile ? `Clínica ID: ${profile.clinic_id || 'N/A'}` : undefined
        });
      } catch (error) {
        healthChecks.push({
          name: 'Perfil do Usuário',
          status: 'error',
          message: 'Erro inesperado ao carregar perfil',
          icon: <User className="h-4 w-4" />
        });
      }
    }

    // 4. Teste de Fluxos
    try {
      const { data: flows, error } = await supabase
        .from('flows')
        .select('id, name, is_active')
        .limit(10);

      healthChecks.push({
        name: 'Sistema de Fluxos',
        status: error ? 'error' : 'success',
        message: error ? `Erro: ${error.message}` : `${flows?.length || 0} fluxos encontrados`,
        icon: <GitBranch className="h-4 w-4" />,
        details: flows ? `Fluxos ativos: ${flows.filter(f => f.is_active).length}` : undefined
      });
    } catch (error) {
      healthChecks.push({
        name: 'Sistema de Fluxos',
        status: 'error',
        message: 'Erro ao acessar fluxos',
        icon: <GitBranch className="h-4 w-4" />
      });
    }

    // 5. Teste de Execuções de Fluxo
    try {
      const { data: executions, error } = await supabase
        .from('flow_executions')
        .select('id, status')
        .limit(10);

      healthChecks.push({
        name: 'Execuções de Fluxo',
        status: error ? 'error' : 'success',
        message: error ? `Erro: ${error.message}` : `${executions?.length || 0} execuções encontradas`,
        icon: <Settings className="h-4 w-4" />,
        details: executions ? `Em andamento: ${executions.filter(e => e.status === 'em-andamento').length}` : undefined
      });
    } catch (error) {
      healthChecks.push({
        name: 'Execuções de Fluxo',
        status: 'error',
        message: 'Erro ao acessar execuções',
        icon: <Settings className="h-4 w-4" />
      });
    }

    // 6. Teste de Pacientes (apenas para clínicas)
    if (user?.role === 'clinic') {
      try {
        const { data: patients, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'patient')
          .eq('clinic_id', user.clinic_id);

        healthChecks.push({
          name: 'Sistema de Pacientes',
          status: error ? 'error' : 'success',
          message: error ? `Erro: ${error.message}` : `${patients?.length || 0} pacientes encontrados`,
          icon: <Users className="h-4 w-4" />,
          details: `Clínica ID: ${user.clinic_id}`
        });
      } catch (error) {
        healthChecks.push({
          name: 'Sistema de Pacientes',
          status: 'error',
          message: 'Erro ao acessar pacientes',
          icon: <Users className="h-4 w-4" />
        });
      }
    }

    // 7. Teste de Navegação
    const routes = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/flows', name: 'Flow Builder' },
      { path: '/my-flows', name: 'Meus Fluxos' },
      { path: '/profile', name: 'Perfil' },
      { path: '/patients', name: 'Pacientes' },
      { path: '/settings', name: 'Configurações' }
    ];

    let routeErrors = 0;
    routes.forEach(route => {
      try {
        const element = document.querySelector(`[href="${route.path}"]`);
        if (!element) routeErrors++;
      } catch {
        routeErrors++;
      }
    });

    healthChecks.push({
      name: 'Sistema de Navegação',
      status: routeErrors === 0 ? 'success' : routeErrors < 3 ? 'warning' : 'error',
      message: `${routes.length - routeErrors}/${routes.length} rotas acessíveis`,
      icon: <Navigation className="h-4 w-4" />,
      details: routeErrors > 0 ? `${routeErrors} rotas com problemas` : 'Todas as rotas funcionais'
    });

    // 8. Teste de Upload (simulado)
    healthChecks.push({
      name: 'Sistema de Upload',
      status: 'warning',
      message: 'Componente disponível - teste manual necessário',
      icon: <Upload className="h-4 w-4" />,
      details: 'Use o FileUploadTester para testar uploads'
    });

    setChecks(healthChecks);
    setIsRunning(false);

    // Mostrar resumo
    const successCount = healthChecks.filter(c => c.status === 'success').length;
    const errorCount = healthChecks.filter(c => c.status === 'error').length;
    const warningCount = healthChecks.filter(c => c.status === 'warning').length;

    if (errorCount === 0) {
      toast.success(`Verificação concluída: ${successCount} testes passaram com sucesso!`);
    } else {
      toast.error(`Verificação concluída: ${errorCount} erro(s) encontrado(s)`);
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'OK';
      case 'error': return 'Erro';
      case 'warning': return 'Atenção';
      default: return 'Pendente';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Verificação Completa do Sistema
          </CardTitle>
          <Button 
            onClick={runHealthChecks}
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Executar Verificação
              </>
            )}
          </Button>
        </div>
        
        {checks.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="bg-green-100 text-green-700">
              {successCount} Sucessos
            </Badge>
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {warningCount} Avisos
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Erros
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${getStatusColor(check.status)}`}>
                {check.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{check.name}</h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(check.status)}
                    <span className="text-sm font-medium">
                      {getStatusText(check.status)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-muted-foreground italic">{check.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {checks.length > 0 && (
          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos Passos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Teste manualmente o upload de arquivos usando o FileUploadTester</li>
                <li>Navegue entre todas as páginas para verificar redirecionamentos</li>
                <li>Crie um novo fluxo no Flow Builder para testar a funcionalidade</li>
                <li>Se for clínica: teste adicionar/editar pacientes</li>
                <li>Verifique se as notificações (toasts) aparecem corretamente</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
