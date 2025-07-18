import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, Calculator } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePatientResponses } from '@/hooks/usePatientResponses';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

const formatResponseValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.join(', ');
  
  // Se for um objeto JSON complexo, tentar extrair informações úteis
  if (typeof value === 'object') {
    // Verificar se tem respostas específicas
    if (value.fieldResponses && Object.keys(value.fieldResponses).length > 0) {
      return Object.entries(value.fieldResponses)
        .map(([key, val]: [string, any]) => `${key}: ${val}`)
        .join('; ');
    }
    if (value.questionResponses && Object.keys(value.questionResponses).length > 0) {
      return Object.entries(value.questionResponses)
        .map(([key, val]: [string, any]) => `${key}: ${val}`)
        .join('; ');
    }
    if (value.calculatorResults && Object.keys(value.calculatorResults).length > 0) {
      return Object.entries(value.calculatorResults)
        .map(([key, val]: [string, any]) => `${key}: ${val}`)
        .join('; ');
    }
    // Se não tem dados úteis, não mostrar
    return '-';
  }
  
  return String(value);
};

const groupResponsesByDate = (responses: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  responses.forEach(response => {
    if (response.completedAt) {
      const date = format(parseISO(response.completedAt), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(response);
    }
  });
  
  return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
};

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { responses, loading } = usePatientResponses(patient?.user_id);

  if (!patient) return null;

  const completedResponses = responses.filter(r => r.status === 'completed');
  const groupedByDate = groupResponsesByDate(completedResponses);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[95vh] bg-white dark:bg-[#0B0B0B] flex flex-col overflow-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Ficha Médica - {patient.name}
          </DialogTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total de formulários respondidos: {completedResponses.length}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando histórico médico...</span>
            </div>
          ) : completedResponses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma Ficha Disponível</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Este paciente ainda não completou nenhum formulário médico.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Informações do Paciente */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Paciente
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Nome Completo:</span>
                      <div className="text-gray-900 dark:text-gray-100 ml-2">{patient.name}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Email:</span>
                      <div className="text-gray-900 dark:text-gray-100 ml-2">{patient.email}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {patient.phone && (
                      <div>
                        <span className="font-semibold text-blue-800 dark:text-blue-200">Telefone:</span>
                        <div className="text-gray-900 dark:text-gray-100 ml-2">{patient.phone}</div>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Total de Formulários:</span>
                      <div className="text-gray-900 dark:text-gray-100 ml-2">{completedResponses.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fichas por Data */}
              {groupedByDate.map(([dateKey, dateResponses]) => (
                <div key={dateKey} className="space-y-4">
                  <div className="flex items-center gap-3 py-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {format(parseISO(dateKey), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {dateResponses.length} formulário{dateResponses.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {dateResponses.map((response, responseIndex) => (
                    <div key={response.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      {/* Cabeçalho do Formulário */}
                      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {response.flowName}
                            </h3>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                              Completo
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(parseISO(response.completedAt), 'HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo do Formulário */}
                      <div className="p-6 space-y-6">
                        {response.allSteps && response.allSteps.length > 0 ? (
                          <div className="space-y-4">
                            {/* Filtrar apenas steps com respostas válidas */}
                            {response.allSteps
                              .filter((step: any) => {
                                const formattedResponse = formatResponseValue(step.response);
                                return formattedResponse !== '-' && 
                                       formattedResponse !== 'null' && 
                                       step.type !== 'formStart' && 
                                       step.type !== 'formEnd' &&
                                       step.title && 
                                       step.title !== 'Formulário';
                              })
                              .map((step: any, stepIndex: number) => {
                                if (step.type === 'calculator') {
                                  return (
                                    <div key={stepIndex} className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Calculator className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        <div className="font-medium text-orange-800 dark:text-orange-200">
                                          {step.title}
                                        </div>
                                      </div>
                                      <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                                        {formatResponseValue(step.response)}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={stepIndex} className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2">
                                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        {step.title}
                                      </div>
                                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        {formatResponseValue(step.response)}
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            
                            {/* Se não há respostas válidas nos steps, mostrar a resposta principal */}
                            {response.allSteps.filter((step: any) => {
                              const formattedResponse = formatResponseValue(step.response);
                              return formattedResponse !== '-' && 
                                     formattedResponse !== 'null' && 
                                     step.type !== 'formStart' && 
                                     step.type !== 'formEnd';
                            }).length === 0 && (
                              <div className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2">
                                <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                  Informações do Formulário
                                </div>
                                <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                  {formatResponseValue(response.response)}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2">
                            <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              Informações do Formulário
                            </div>
                            <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              {formatResponseValue(response.response)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};