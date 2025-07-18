import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Building2, 
  Users, 
  User, 
  Eye, 
  UserCog,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Help = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const helpSections = [
    {
      id: 'super_admin',
      title: 'Super Administrador',
      description: 'Guia completo para super administradores do sistema',
      icon: UserCog,
      color: 'bg-red-500',
      roles: ['super_admin'],
      path: '/help/super-admin'
    },
    {
      id: 'clinic',
      title: 'Clínica/Administrador',
      description: 'Guia para administradores de clínicas e gestores',
      icon: Building2,
      color: 'bg-blue-500',
      roles: ['clinic', 'admin'],
      path: '/help/clinic'
    },
    {
      id: 'manager',
      title: 'Gerente',
      description: 'Guia para gerentes de equipe e coordenadores',
      icon: Users,
      color: 'bg-green-500',
      roles: ['manager'],
      path: '/help/manager'
    },
    {
      id: 'professional',
      title: 'Profissional',
      description: 'Guia para profissionais de saúde e especialistas',
      icon: Stethoscope,
      color: 'bg-purple-500',
      roles: ['professional'],
      path: '/help/professional'
    },
    {
      id: 'assistant',
      title: 'Assistente',
      description: 'Guia para assistentes e auxiliares',
      icon: User,
      color: 'bg-orange-500',
      roles: ['assistant'],
      path: '/help/assistant'
    },
    {
      id: 'viewer',
      title: 'Visualizador',
      description: 'Guia para usuários com acesso apenas de visualização',
      icon: Eye,
      color: 'bg-gray-500',
      roles: ['viewer'],
      path: '/help/viewer'
    },
    {
      id: 'patient',
      title: 'Paciente',
      description: 'Guia para pacientes e usuários finais',
      icon: User,
      color: 'bg-teal-500',
      roles: ['patient'],
      path: '/help/patient'
    }
  ];

  const userRole = user?.role || 'patient';
  
  // Filtrar seções baseado no papel do usuário
  const availableSections = helpSections.filter(section => 
    section.roles.includes(userRole as any) || userRole === 'super_admin'
  );

  const currentUserSection = helpSections.find(section => 
    section.roles.includes(userRole as any)
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground">
            Encontre guias e tutoriais específicos para seu perfil de usuário
          </p>
        </div>
        {currentUserSection && (
          <Button 
            onClick={() => navigate(currentUserSection.path)}
            className="flex items-center gap-2"
          >
            <currentUserSection.icon className="h-4 w-4" />
            Guia para {currentUserSection.title}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Seção principal para o usuário atual */}
      {currentUserSection && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`${currentUserSection.color} text-white p-2 rounded-lg`}>
                <currentUserSection.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentUserSection.title}
                  <Badge variant="default">Seu Perfil</Badge>
                </CardTitle>
                <CardDescription>
                  {currentUserSection.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acesse o guia específico para seu perfil com instruções detalhadas sobre todas as 
              funcionalidades disponíveis para você.
            </p>
            <Button 
              onClick={() => navigate(currentUserSection.path)}
              className="w-full md:w-auto"
            >
              Acessar Guia Completo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid com todas as seções disponíveis */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {userRole === 'super_admin' ? 'Todos os Guias Disponíveis' : 'Guias Relacionados'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableSections.map((section) => {
            const Icon = section.icon;
            const isCurrentUser = section.roles.includes(userRole as any);
            
            return (
              <Card 
                key={section.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  isCurrentUser ? 'ring-2 ring-primary/20' : ''
                }`}
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`${section.color} text-white p-2 rounded-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {section.title}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-3">
                    {section.description}
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Guia
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Seção de contato e suporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precisa de mais ajuda?</CardTitle>
          <CardDescription>
            Não encontrou o que procurava? Entre em contato conosco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="text-sm">
              <strong>Email de Suporte:</strong>
              <br />
              <a href="mailto:suporte@fitclub.app.br" className="text-primary hover:underline">
                suporte@fitclub.app.br
              </a>
            </div>
            <div className="text-sm">
              <strong>Documentação Técnica:</strong>
              <br />
              <a href="#" className="text-primary hover:underline">
                docs.fitclub.app.br
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;