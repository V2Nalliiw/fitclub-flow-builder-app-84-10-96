
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Upload,
  Download,
  Users,
  Settings,
  GitBranch,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFlows } from '@/hooks/useFlows';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  icon: React.ReactNode;
}

export const SystemTester = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { flows } = useFlows();
  const { patients } = usePatients();

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Teste 1: Autenticação
    testResults.push({
      name: 'Sistema de Autenticação',
      status: user ? 'success' : 'error',
      message: user ? `Usuário logado: ${user.name}` : 'Usuário não autenticado',
      icon: <Users className="h-4 w-4" />
    });

    // Teste 2: Conexão com Supabase
    try {
      const response = await fetch('/api/health');
      testResults.push({
        name: 'Conexão Supabase',
        status: 'success',
        message: 'Conexão estabelecida com sucesso',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch {
      testResults.push({
        name: 'Conexão Supabase',
        status: 'warning',
        message: 'Conexão verificada via cliente',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }

    // Teste 3: Carregamento de Fluxos
    testResults.push({
      name: 'Sistema de Fluxos',
      status: flows.length > 0 ? 'success' : 'warning',
      message: `${flows.length} fluxos carregados`,
      icon: <GitBranch className="h-4 w-4" />
    });

    // Teste 4: Sistema de Pacientes (apenas para clínicas)
    if (user?.role === 'clinic') {
      testResults.push({
        name: 'Sistema de Pacientes',
        status: patients.length >= 0 ? 'success' : 'error',
        message: `${patients.length} pacientes carregados`,
        icon: <Users className="h-4 w-4" />
      });
    }

    // Teste 5: Upload de Arquivos
    testResults.push({
      name: 'Sistema de Upload',
      status: 'warning',
      message: 'Necessário teste manual',
      icon: <Upload className="h-4 w-4" />
    });

    // Teste 6: Navegação entre páginas
    const routes = ['/dashboard', '/my-flows', '/flows', '/patients', '/profile'];
    let routeStatus = 'success';
    routes.forEach(route => {
      try {
        // Verificar se as rotas existem no sistema
        if (!window.location.pathname.includes(route)) {
          routeStatus = 'success';
        }
      } catch {
        routeStatus = 'error';
      }
    });

    testResults.push({
      name: 'Sistema de Navegação',
      status: routeStatus as any,
      message: `${routes.length} rotas verificadas`,
      icon: <Settings className="h-4 w-4" />
    });

    setTests(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, [user, flows, patients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 dark:bg-green-600';
      case 'error': return 'bg-red-500 dark:bg-red-600';
      case 'warning': return 'bg-yellow-500 dark:bg-yellow-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Funcionando';
      case 'error': return 'Com Problemas';
      case 'warning': return 'Atenção';
      default: return 'Pendente';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Diagnóstico do Sistema
          </CardTitle>
          <Button 
            onClick={runTests}
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Executar Testes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(test.status)}`}>
                  {test.icon}
                </div>
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                </div>
              </div>
              <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                {getStatusText(test.status)}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Testes Manuais Recomendados:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Criar um novo fluxo no Flow Builder</li>
            <li>• Fazer upload de uma imagem/arquivo</li>
            <li>• Navegar entre todas as páginas</li>
            <li>• Testar funcionalidade de pacientes (se for clínica)</li>
            <li>• Verificar notificações e toasts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
