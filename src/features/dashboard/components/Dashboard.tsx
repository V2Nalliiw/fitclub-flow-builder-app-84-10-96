
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, GitBranch, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardCards = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { title: 'Total de Clínicas', value: '12', icon: Users, color: 'text-blue-600' },
          { title: 'Usuários Ativos', value: '248', icon: Users, color: 'text-green-600' },
          { title: 'Mensagens Enviadas', value: '1,429', icon: MessageSquare, color: 'text-purple-600' },
          { title: 'Fluxos Ativos', value: '67', icon: GitBranch, color: 'text-orange-600' },
        ];
      case 'clinic':
        return [
          { title: 'Pacientes Ativos', value: '34', icon: Users, color: 'text-blue-600' },
          { title: 'Fluxos Criados', value: '8', icon: GitBranch, color: 'text-green-600' },
          { title: 'Mensagens Hoje', value: '23', icon: MessageSquare, color: 'text-purple-600' },
          { title: 'Taxa de Resposta', value: '87%', icon: TrendingUp, color: 'text-orange-600' },
        ];
      case 'patient':
        return [
          { title: 'Formulários Pendentes', value: '2', icon: MessageSquare, color: 'text-blue-600' },
          { title: 'Dias de Tratamento', value: '15', icon: TrendingUp, color: 'text-green-600' },
          { title: 'Próxima Consulta', value: 'Amanhã', icon: Users, color: 'text-purple-600' },
        ];
      default:
        return [];
    }
  };

  const cards = getDashboardCards();

  return (
    <div className="space-y-6 px-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui está um resumo das suas atividades
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-3 rounded-lg bg-secondary/50">
                <div className="w-2 h-2 bg-[#5D8701] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Novo formulário respondido por João Silva
                  </p>
                  <p className="text-xs text-muted-foreground">
                    há 2 horas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
