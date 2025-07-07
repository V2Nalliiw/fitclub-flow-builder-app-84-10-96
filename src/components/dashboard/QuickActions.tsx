
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BarChart3, Settings, FileText, GitBranch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getQuickActions = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          {
            title: 'Gerenciar Clínicas',
            description: 'Visualizar e administrar todas as clínicas',
            icon: Users,
            action: () => navigate('/clinics'),
            color: 'text-muted-foreground hover:text-primary'
          },
          {
            title: 'Ver Relatórios',
            description: 'Análises e métricas do sistema',
            icon: BarChart3,
            action: () => navigate('/analytics'),
            color: 'text-primary hover:text-primary/80'
          },
          {
            title: 'Configurações',
            description: 'Configurações globais do sistema',
            icon: Settings,
            action: () => navigate('/settings'),
            color: 'text-muted-foreground hover:text-primary'
          },
          {
            title: 'Gerenciar Permissões',
            description: 'Controlar acessos e roles',
            icon: Settings,
            action: () => navigate('/permissions'),
            color: 'text-muted-foreground hover:text-primary'
          }
        ];

      case 'clinic':
        return [
          {
            title: 'Criar Novo Fluxo',
            description: 'Desenvolver um novo fluxo de tratamento',
            icon: Plus,
            action: () => navigate('/flows'),
            color: 'text-primary hover:text-primary/80'
          },
          {
            title: 'Gerenciar Pacientes',
            description: 'Ver e administrar pacientes',
            icon: Users,
            action: () => navigate('/patients'),
            color: 'text-muted-foreground hover:text-primary'
          },
          {
            title: 'Meus Fluxos',
            description: 'Visualizar fluxos criados',
            icon: GitBranch,
            action: () => navigate('/my-flows'),
            color: 'text-muted-foreground hover:text-primary'
          },
          {
            title: 'Relatórios',
            description: 'Análises dos tratamentos',
            icon: BarChart3,
            action: () => navigate('/analytics'),
            color: 'text-muted-foreground hover:text-primary'
          }
        ];

      case 'patient':
        return [
          {
            title: 'Meus Tratamentos',
            description: 'Acompanhar progresso dos tratamentos',
            icon: GitBranch,
            action: () => navigate('/my-flows'),
            color: 'text-muted-foreground hover:text-primary'
          },
          {
            title: 'Formulários',
            description: 'Preencher formulários pendentes',
            icon: FileText,
            action: () => navigate('/forms'),
            color: 'text-primary hover:text-primary/80'
          },
          {
            title: 'Meu Perfil',
            description: 'Atualizar informações pessoais',
            icon: Users,
            action: () => navigate('/profile'),
            color: 'text-muted-foreground hover:text-primary'
          }
        ];

      default:
        return [];
    }
  };

  const actions = getQuickActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start h-auto p-4 hover:bg-secondary/50"
              onClick={action.action}
            >
              <div className="flex items-start gap-3 text-left">
                <action.icon className={`h-5 w-5 mt-0.5 ${action.color}`} />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
