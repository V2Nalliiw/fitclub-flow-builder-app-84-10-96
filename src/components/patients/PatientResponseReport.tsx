import React, { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FormStep {
  id: string;
  title: string;
  type: string;
  response?: any;
  status: string;
  completedAt?: string;
}

interface Response {
  id: string;
  flowName: string;
  stepTitle: string;
  response: string;
  completedAt: string;
  status: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  allSteps?: FormStep[];
  startedAt?: string;
}

interface PatientResponseReportProps {
  patient: {
    name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
  responses: Response[];
  clinicName?: string;
}

export const PatientResponseReport = forwardRef<HTMLDivElement, PatientResponseReportProps>(
  ({ patient, responses, clinicName = "Clínica" }, ref) => {
    const formatResponseValue = (value: any, type: string) => {
      if (value === null || value === undefined) return 'Não respondido';
      
      if (typeof value === 'object') {
        if (type === 'calculator' && value.result !== undefined) {
          return `Resultado: ${value.result}`;
        }
        if (value.selected) return value.selected;
        if (value.value !== undefined) return value.value;
        return JSON.stringify(value, null, 2);
      }
      
      return String(value);
    };

    const getStatusBadge = (status: string) => {
      if (status === 'completed') {
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completo</Badge>;
      } else if (status === 'in_progress') {
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Em Andamento</Badge>;
      } else {
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      }
    };

    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relatório de Respostas do Paciente
          </h1>
          <p className="text-lg text-gray-600">{clinicName}</p>
          <p className="text-sm text-gray-500">
            Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Patient Info */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Dados do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nome Completo</p>
                <p className="text-lg">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg">{patient.email}</p>
              </div>
              {patient.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Telefone</p>
                  <p className="text-lg">{patient.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">Data de Cadastro</p>
                <p className="text-lg">
                  {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5" />
              Resumo das Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{responses.length}</p>
                <p className="text-sm text-gray-600">Total de Formulários</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {responses.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Formulários Completos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {responses.filter(r => r.status !== 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Pendentes/Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Responses */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Respostas Detalhadas
          </h2>
          
          {responses.map((response, index) => (
            <Card key={response.id} className="border-2 page-break-inside-avoid">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {response.flowName}
                    </CardTitle>
                    <p className="text-lg text-blue-600 font-medium">
                      {response.stepTitle}
                    </p>
                  </div>
                  {getStatusBadge(response.status)}
                </div>
                
                {/* Progress Info */}
                {response.totalSteps > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progresso do Formulário</span>
                      <span>{response.completedSteps}/{response.totalSteps} etapas concluídas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all" 
                        style={{ width: `${response.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                  {response.startedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Iniciado: {format(new Date(response.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                  {response.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Finalizado: {format(new Date(response.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Summary Response */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Resumo Geral
                  </h4>
                  <p className="text-gray-700">{response.response}</p>
                </div>

                {/* Detailed Steps */}
                {response.allSteps && response.allSteps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Respostas Individuais ({response.allSteps.length} itens)
                    </h4>
                    <div className="space-y-4">
                      {response.allSteps.map((step, stepIndex) => (
                        <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">
                                {stepIndex + 1}. {step.title}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {step.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {step.status === 'completed' ? 'Respondido' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-100 rounded p-3">
                            <p className="text-sm font-medium text-gray-600 mb-1">Resposta:</p>
                            <p className="text-gray-900">
                              {formatResponseValue(step.response, step.type)}
                            </p>
                          </div>
                          
                          {step.completedAt && (
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Respondido em: {format(new Date(step.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              {index < responses.length - 1 && <Separator className="my-8" />}
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
          <p>Este relatório foi gerado automaticamente pelo sistema de gestão de pacientes</p>
          <p>{clinicName} - {format(new Date(), "yyyy", { locale: ptBR })}</p>
        </div>

        <style>{`
          @media print {
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        `}</style>
      </div>
    );
  }
);

PatientResponseReport.displayName = 'PatientResponseReport';