import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientResponsesTimeline } from './PatientResponsesTimeline';
import { usePatientResponses } from '@/hooks/usePatientResponses';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { responses, responseCount, loading } = usePatientResponses(patient?.user_id);

  if (!patient) return null;

  const completedResponses = responses.filter(r => r.status === 'completed');
  const inProgressResponses = responses.filter(r => r.status === 'in_progress');
  const pendingResponses = responses.filter(r => r.status === 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <MessageSquare className="h-5 w-5 text-primary" />
            Histórico de Respostas - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          {/* Resumo expandido */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Estatísticas</h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white dark:bg-[#0E0E0E]/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{responseCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total de Formulários</div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedResponses.length}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Completos</div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{inProgressResponses.length}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Em Andamento</div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{pendingResponses.length}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</div>
                  </div>
                </div>

                {responses.length > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Última Atividade</div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(responses[0]?.completedAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taxa de Conclusão</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(completedResponses.length / responseCount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((completedResponses.length / responseCount) * 100)}% dos formulários
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="w-full justify-center border-primary text-primary">
                  <FileText className="h-3 w-3 mr-1" />
                  Todas as Respostas
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completas ({completedResponses.length})
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Em Andamento ({inProgressResponses.length})
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Respostas expandida */}
          <div className="lg:col-span-3 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Histórico Completo de Formulários
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clique em "Ver Respostas Detalhadas" para expandir as respostas de cada formulário
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-500">Carregando histórico de respostas...</span>
                    </div>
                  ) : (
                    <PatientResponsesTimeline 
                      responses={responses} 
                      patient={patient ? {
                        name: patient.name,
                        email: patient.email,
                        phone: patient.phone,
                        created_at: patient.created_at
                      } : undefined}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};