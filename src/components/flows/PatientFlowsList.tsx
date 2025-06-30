
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlows } from '@/hooks/useFlows';
import { Play, ArrowRight, Workflow, Activity, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const PatientFlowsList = () => {
  const { flows, isLoading, hasLoadedOnce, isEmpty, refreshFlows } = useFlows();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando seus formulários...</p>
      </div>
    );
  }

  if (!hasLoadedOnce || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <Workflow className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Dicas e Formulários
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Seus formulários diários e conteúdos personalizados para acompanhar seu tratamento
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <Workflow className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Nenhum formulário disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                Entre em contato com sua clínica para receber seus primeiros formulários e dicas personalizadas.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 max-w-md">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                  💡 Os formulários aparecerão aqui quando sua clínica criar um plano personalizado para você.
                </p>
              </div>
              <Button 
                onClick={refreshFlows}
                variant="outline" 
                className="mt-4"
              >
                Verificar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Workflow className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Seus Formulários
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {flows.length} {flows.length === 1 ? 'formulário disponível' : 'formulários disponíveis'} para você
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Card key={flow.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                      {flow.name}
                    </CardTitle>
                    {flow.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {flow.description}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={flow.is_active ? 'default' : 'secondary'}
                    className={flow.is_active ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200' : ''}
                  >
                    {flow.is_active ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {flow.nodes?.length || 0}
                    </div>
                    <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">Etapas</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {flow.nodes?.filter(n => n.type === 'formStart').length || 0}
                    </div>
                    <div className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">Formulários</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-500">Progresso</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Disponível desde {formatDistanceToNow(new Date(flow.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 group"
                    size="lg"
                    disabled={!flow.is_active}
                  >
                    <Play className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Começar Formulários
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
