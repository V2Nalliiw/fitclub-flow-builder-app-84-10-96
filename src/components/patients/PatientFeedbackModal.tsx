import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientResponsesTimeline } from './PatientResponsesTimeline';

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
  if (!patient) return null;

  // Mock data - replace with real data
  const mockResponses = [
    {
      id: '1',
      flowName: 'Avaliação Inicial',
      stepTitle: 'Questionário de Saúde',
      response: 'Não tenho nenhuma condição médica pré-existente',
      completedAt: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      flowName: 'Check-up Semanal',
      stepTitle: 'Como você está se sentindo?',
      response: 'Me sinto muito melhor esta semana, com mais energia',
      completedAt: '2024-01-14T15:45:00Z',
      status: 'completed'
    },
    {
      id: '3',
      flowName: 'Exercícios Diários',
      stepTitle: 'Quantos exercícios você fez hoje?',
      response: '5 exercícios de fortalecimento',
      completedAt: '2024-01-13T09:15:00Z',
      status: 'completed'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <MessageSquare className="h-5 w-5 text-[#5D8701]" />
            Respostas e Feedback - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
          {/* Resumo */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-r from-[#5D8701]/5 to-[#4a6e01]/5 dark:from-[#5D8701]/10 dark:to-[#4a6e01]/10 border-[#5D8701]/20">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Resumo</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total de Respostas</span>
                  <Badge variant="secondary" className="bg-[#5D8701]/10 text-[#5D8701]">
                    {mockResponses.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Última Resposta</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(mockResponses[0]?.completedAt), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resposta</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                    100%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-950/90">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="w-full justify-center border-[#5D8701] text-[#5D8701]">
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
            <Card className="h-full bg-white/90 dark:bg-gray-950/90">
              <CardHeader className="pb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#5D8701]" />
                  Timeline de Respostas
                </h4>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <ScrollArea className="h-full pr-4">
                  <PatientResponsesTimeline responses={mockResponses} />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};