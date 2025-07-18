import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePatientResponses } from '@/hooks/usePatientResponses';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

const formatResponseValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { responses, loading } = usePatientResponses(patient?.user_id);

  if (!patient) return null;

  const completedResponses = responses.filter(r => r.status === 'completed');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <User className="h-5 w-5" />
            Ficha de Respostas do Paciente
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Carregando respostas...</span>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              {/* Informações do Paciente */}
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Informações do Paciente</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nome:</span>
                    <span className="ml-2 text-gray-900">{patient.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{patient.email}</span>
                  </div>
                  {patient.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Telefone:</span>
                      <span className="ml-2 text-gray-900">{patient.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Total de Formulários:</span>
                    <span className="ml-2 text-gray-900">{responses.length}</span>
                  </div>
                </div>
              </div>

              {/* Formulários Respondidos */}
              {completedResponses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum formulário foi completado ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulários Respondidos ({completedResponses.length})
                  </h2>
                  
                  {completedResponses.map((response, index) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      {/* Cabeçalho do Formulário */}
                      <div className="border-b border-gray-100 pb-3 mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          {response.flowName || 'Formulário'}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {response.completedAt ? 
                              format(new Date(response.completedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) :
                              'Data não disponível'
                            }
                          </div>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            Completo
                          </span>
                        </div>
                      </div>

                      {/* Respostas */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800 text-sm">Respostas:</h4>
                        {response.allSteps && Array.isArray(response.allSteps) && response.allSteps.length > 0 ? (
                          <div className="space-y-2">
                            {response.allSteps.map((step, stepIndex) => (
                              <div key={stepIndex} className="bg-gray-50 p-3 rounded border-l-4 border-gray-200">
                                <div className="font-medium text-gray-700 text-sm mb-1">
                                  {step.title}
                                </div>
                                <div className="text-gray-900 text-sm leading-relaxed">
                                  {formatResponseValue(step.response)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-200">
                            <div className="text-gray-900 text-sm leading-relaxed">
                              {formatResponseValue(response.response)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};