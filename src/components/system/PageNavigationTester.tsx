
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Navigation, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Home,
  GitBranch,
  Users,
  User,
  Settings,
  BarChart3,
  FileText,
  Building2,
  Palette,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NavigationTest {
  path: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'pending' | 'success' | 'error';
  accessible: boolean;
}

export const PageNavigationTester = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [tests, setTests] = useState<NavigationTest[]>([
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <Home className="h-4 w-4" />,
      description: 'Página principal com métricas e atividades',
      status: 'pending',
      accessible: true
    },
    {
      path: '/flows',
      name: 'Flow Builder',
      icon: <GitBranch className="h-4 w-4" />,
      description: 'Construtor visual de fluxos',
      status: 'pending',
      accessible: true
    },
    {
      path: '/my-flows',
      name: 'Meus Fluxos',
      icon: <FileText className="h-4 w-4" />,
      description: 'Lista dos fluxos criados',
      status: 'pending',
      accessible: true
    },
    {
      path: '/profile',
      name: 'Perfil',
      icon: <User className="h-4 w-4" />,
      description: 'Configurações do perfil do usuário',
      status: 'pending',
      accessible: true
    },
    {
      path: '/patients',
      name: 'Pacientes',
      icon: <Users className="h-4 w-4" />,
      description: 'Gerenciamento de pacientes (apenas clínicas)',
      status: 'pending',
      accessible: user?.role === 'clinic'
    },
    {
      path: '/settings',
      name: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      description: 'Configurações gerais do sistema',
      status: 'pending',
      accessible: true
    },
    {
      path: '/team',
      name: 'Equipe',
      icon: <Users className="h-4 w-4" />,
      description: 'Gerenciamento da equipe',
      status: 'pending',
      accessible: user?.role !== 'patient'
    },
    {
      path: '/clinics',
      name: 'Clínicas',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Gerenciamento de clínicas (super admin)',
      status: 'pending',
      accessible: user?.role === 'super_admin'
    },
    {
      path: '/analytics',
      name: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Relatórios e análises',
      status: 'pending',
      accessible: user?.role !== 'patient'
    },
    {
      path: '/customization',
      name: 'Personalização',
      icon: <Palette className="h-4 w-4" />,
      description: 'Personalização da interface',
      status: 'pending',
      accessible: true
    },
    {
      path: '/permissions',
      name: 'Permissões',
      icon: <Shield className="h-4 w-4" />,
      description: 'Gerenciamento de permissões',
      status: 'pending',
      accessible: user?.role === 'super_admin'
    },
    {
      path: '/forms',
      name: 'Formulários',
      icon: <FileText className="h-4 w-4" />,
      description: 'Gerenciamento de formulários',
      status: 'pending',
      accessible: true
    }
  ]);

  const testNavigation = async (test: NavigationTest) => {
    try {
      const originalPath = location.pathname;
      
      // Tentar navegar
      navigate(test.path);
      
      // Aguardar um pouco para a navegação
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const success = currentPath === test.path;
        
        setTests(prev => prev.map(t => 
          t.path === test.path 
            ? { ...t, status: success ? 'success' : 'error' }
            : t
        ));

        if (success) {
          toast.success(`Navegação para ${test.name} bem-sucedida!`);
          // Voltar para a página original
          setTimeout(() => navigate(originalPath), 1000);
        } else {
          toast.error(`Falha na navegação para ${test.name}`);
        }
      }, 500);
      
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.path === test.path 
          ? { ...t, status: 'error' }
          : t
      ));
      toast.error(`Erro ao navegar para ${test.name}: ${error}`);
    }
  };

  const testAllNavigation = async () => {
    const accessibleTests = tests.filter(t => t.accessible);
    
    for (const test of accessibleTests) {
      await new Promise(resolve => {
        testNavigation(test);
        setTimeout(resolve, 2000); // Aguardar 2 segundos entre testes
      });
    }
    
    toast.success('Teste de navegação completo!');
  };

  const resetTests = () => {
    setTests(prev => prev.map(t => ({ ...t, status: 'pending' })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const accessibleTests = tests.filter(t => t.accessible);
  const successCount = accessibleTests.filter(t => t.status === 'success').length;
  const errorCount = accessibleTests.filter(t => t.status === 'error').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Teste de Navegação
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={resetTests} variant="outline" size="sm">
              Resetar
            </Button>
            <Button onClick={testAllNavigation} size="sm">
              Testar Todas
            </Button>
          </div>
        </div>
        
        {(successCount > 0 || errorCount > 0) && (
          <div className="flex gap-2 mt-2">
            {successCount > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-700">
                {successCount} Sucessos
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
        <div className="grid gap-3">
          {tests.map((test, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 border rounded-lg ${
                !test.accessible ? 'opacity-50 bg-gray-50' : ''
              }`}
            >
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {test.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{test.name}</h4>
                  {!test.accessible && (
                    <Badge variant="secondary" className="text-xs">
                      Não acessível para {user?.role}
                    </Badge>
                  )}
                  {getStatusIcon(test.status)}
                </div>
                <p className="text-sm text-muted-foreground">{test.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <code className="bg-gray-100 px-1 rounded">{test.path}</code>
                </p>
              </div>
              {test.accessible && (
                <Button
                  onClick={() => testNavigation(test)}
                  variant="outline"
                  size="sm"
                  disabled={test.status === 'success'}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {test.status === 'success' ? 'Testado' : 'Testar'}
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Informações do Teste:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Páginas acessíveis baseadas no seu perfil: <strong>{user?.role}</strong></li>
            <li>• Páginas bloqueadas são mostradas mas não testadas</li>
            <li>• O teste navega para cada página e retorna automaticamente</li>
            <li>• Use "Testar Todas" para um teste sequencial completo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
