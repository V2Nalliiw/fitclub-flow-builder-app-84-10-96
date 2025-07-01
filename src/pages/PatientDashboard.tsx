import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, User, Calendar, Activity, ArrowRight, Workflow } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { usePatientFlows } from '@/hooks/usePatientFlows';
import { useFlowAssignments } from '@/hooks/useFlowAssignments';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasAccess } = useRoleBasedAccess(['patient']);
  const { executions: patientFlows, loading: flowsLoading } = usePatientFlows();
  const { assignments, isLoading: assignmentsLoading } = useFlowAssignments();

  if (!hasAccess) {
    return null;
  }

  // Calcular métricas reais
  const totalFlows = patientFlows?.length || 0;
  const completedFlows = assignments?.filter(a => a.status === 'completed').length || 0;
  const progressPercentage = totalFlows > 0 ? Math.round((completedFlows / totalFlows) * 100) : 0;

  const quickActions = [
    {
      title: 'Meus Formulários',
      description: 'Acesse seus formulários diários e dicas personalizadas',
      icon: FileText,
      action: () => navigate('/my-flows'),
      color: 'bg-[#5D8701]',
      hoverColor: 'hover:bg-[#4a6e01]',
    },
    {
      title: 'Meu Perfil',
      description: 'Visualize e edite suas informações pessoais',
      icon: User,
      action: () => navigate('/profile'),
      color: 'bg-[#5D8701]',
      hoverColor: 'hover:bg-[#4a6e01]',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header de Boas-vindas */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full mb-4 md:mb-6">
            <Workflow className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bem-vindo ao seu painel pessoal. Aqui você pode acessar seus formulários e acompanhar seu progresso.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden cursor-pointer" 
              onClick={action.action}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${action.color}`}></div>
              
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl text-gray-900 dark:text-gray-100 group-hover:text-[#5D8701] transition-colors">
                      {action.title}
                    </CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-[#5D8701] group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                  {action.description}
                </p>
                <Button 
                  className={`w-full ${action.color} ${action.hoverColor} text-white`}
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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="h-5 w-5 text-[#5D8701]" />
              Seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="text-center p-4 bg-gradient-to-br from-[#5D8701]/10 to-[#4a6e01]/5 dark:from-[#5D8701]/20 dark:to-[#4a6e01]/10 rounded-lg border border-[#5D8701]/20">
                <div className="text-2xl md:text-3xl font-bold text-[#5D8701] mb-2">
                  {flowsLoading ? '...' : totalFlows}
                </div>
                <div className="text-xs md:text-sm text-[#5D8701] font-medium">Formulários Disponíveis</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {assignmentsLoading ? '...' : completedFlows}
                </div>
                <div className="text-xs md:text-sm text-green-800 dark:text-green-300 font-medium">Formulários Concluídos</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  {assignmentsLoading ? '...' : `${progressPercentage}%`}
                </div>
                <div className="text-xs md:text-sm text-gray-800 dark:text-gray-300 font-medium">Progresso Geral</div>
              </div>
            </div>
            
            {/* Barra de Progresso */}
            {!assignmentsLoading && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progresso dos Tratamentos</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
