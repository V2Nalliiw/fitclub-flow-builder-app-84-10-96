
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, User, Calendar, Activity, ArrowRight, Workflow } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasAccess } = useRoleBasedAccess(['patient']);

  if (!hasAccess) {
    return null;
  }

  const quickActions = [
    {
      title: 'Meus Formulários',
      description: 'Acesse seus formulários diários e dicas personalizadas',
      icon: FileText,
      action: () => navigate('/my-flows'),
      color: 'bg-blue-500',
    },
    {
      title: 'Meu Perfil',
      description: 'Visualize e edite suas informações pessoais',
      icon: User,
      action: () => navigate('/profile'),
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header de Boas-vindas */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Workflow className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bem-vindo ao seu painel pessoal. Aqui você pode acessar seus formulários e acompanhar seu progresso.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-6 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden cursor-pointer" onClick={action.action}>
              <div className={`absolute top-0 left-0 w-full h-1 ${action.color}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </CardTitle>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {action.description}
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo de Progresso */}
        <Card className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="h-5 w-5 text-blue-500" />
              Seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">0</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">Formulários Disponíveis</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">0</div>
                <div className="text-sm text-green-800 dark:text-green-300">Formulários Concluídos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">0%</div>
                <div className="text-sm text-purple-800 dark:text-purple-300">Progresso Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
