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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] card-standard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <MessageSquare className="h-5 w-5 text-[#5D8701]" />
            Respostas e Feedback - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
          {/* Resumo */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-primary/5 border-primary/20 card-subtle">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Resumo</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total de Respostas</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {responseCount}
                  </Badge>
                </div>
                {responses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Última Resposta</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(responses[0]?.completedAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {responses.length > 0 ? 'Ativo' : 'Aguardando'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-standard">
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
                  Completas
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Recentes
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Respostas */}
          <div className="lg:col-span-2">
            <Card className="h-full card-standard">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Timeline de Respostas
                </h4>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <ScrollArea className="h-full pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-500">Carregando respostas...</span>
                    </div>
                  ) : (
                    <PatientResponsesTimeline responses={responses} />
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