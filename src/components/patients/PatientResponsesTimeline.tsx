import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, MessageSquare, Calendar, ChevronDown, ChevronRight, Clock, BarChart3, FileText, Download, Printer } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { PatientResponseReport } from './PatientResponseReport';

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

interface PatientResponsesTimelineProps {
  responses: Response[];
  patient?: {
    name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
}

const getStatusBadge = (status: string, progress: number, completedSteps: number, totalSteps: number) => {
  if (status === 'completed') {
    return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Completo</Badge>;
  } else if (status === 'in_progress') {
    return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">Em Andamento</Badge>;
  } else if (status === 'pending') {
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">Pendente</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

const getStatusIcon = (status: string) => {
  if (status === 'completed') return CheckCircle;
  if (status === 'in_progress') return Clock;
  return MessageSquare;
};

export const PatientResponsesTimeline: React.FC<PatientResponsesTimelineProps> = ({
  responses,
  patient
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Relatorio_Respostas_${patient?.name?.replace(/\s+/g, '_') || 'Paciente'}_${format(new Date(), 'dd-MM-yyyy')}`,
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const formatResponseValue = (value: any) => {
    if (value === null || value === undefined) return 'Não respondido';
    
    // Se for um objeto, extrair apenas o valor útil
    if (typeof value === 'object') {
      // Verificação mais robusta para objetos de controle interno
      const controlKeys = ['nodeId', 'nodeType', 'timestamp', 'formCompleted', 'whatsappStatus', '_internal', 'metadata'];
      const hasControlKeys = controlKeys.some(key => key in value);
      
      if (hasControlKeys) {
        return 'Processado pelo sistema'; // Para objetos de controle interno
      }
      
      // Se for um array, processar cada item
      if (Array.isArray(value)) {
        const validItems = value.filter(item => 
          item !== null && item !== undefined && 
          (typeof item !== 'object' || !controlKeys.some(key => key in item))
        );
        return validItems.length > 0 ? validItems.join(', ') : 'Lista vazia';
      }
      
      // Verificar propriedades específicas de resposta
      if (value.result !== undefined) return `${value.result}`;
      if (value.selected !== undefined) return `${value.selected}`;
      if (value.value !== undefined) return `${value.value}`;
      if (value.answer !== undefined) return `${value.answer}`;
      if (value.response !== undefined) return `${value.response}`;
      
      // Para outros objetos, extrair apenas chaves importantes
      const keys = Object.keys(value);
      if (keys.length === 0) return 'Vazio';
      
      // Filtrar chaves importantes (não são de controle)
      const importantKeys = keys.filter(key => 
        !controlKeys.includes(key) && 
        !key.startsWith('_') && 
        value[key] !== null && 
        value[key] !== undefined &&
        typeof value[key] !== 'function'
      );
      
      if (importantKeys.length > 0) {
        const formatted = importantKeys
          .slice(0, 3) // Limitar a 3 propriedades para não sobrecarregar
          .map(key => {
            const val = value[key];
            if (typeof val === 'object') {
              return `${key}: [objeto]`;
            }
            return `${key}: ${val}`;
          })
          .join(', ');
        
        return formatted + (importantKeys.length > 3 ? '...' : '');
      }
      
      return 'Dados processados';
    }
    
    // Para valores primitivos
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'number') return value.toString();
    
    return String(value).trim() || 'Resposta vazia';
  };

  const renderStepDetails = (steps: FormStep[]) => {
    if (!steps || steps.length === 0) return null;

    return (
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Respostas Detalhadas ({steps.length} itens):
          </h5>
          {patient && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2 text-xs"
              >
                <Printer className="h-3 w-3" />
                Imprimir Relatório
              </Button>
            </div>
          )}
        </div>
        {steps.map((step, index) => (
          <div key={step.id} className="bg-gray-50 dark:bg-[#0E0E0E]/30 rounded-lg p-3 border-l-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-start justify-between mb-2">
              <h6 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                {index + 1}. {step.title}
              </h6>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {step.type}
                </Badge>
                <Badge 
                  variant={step.status === 'completed' ? 'secondary' : 'outline'} 
                  className={step.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : ''}
                >
                  {step.status === 'completed' ? 'Respondido' : 'Pendente'}
                </Badge>
              </div>
            </div>
            {step.response !== null && step.response !== undefined && (
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0E0E0E]/50 p-2 rounded border">
                <strong>Resposta:</strong> {formatResponseValue(step.response)}
              </div>
            )}
            {step.completedAt && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Respondido em: {format(new Date(step.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Hidden Report Component for Printing */}
      <div style={{ display: 'none' }}>
        {patient && (
          <PatientResponseReport
            ref={reportRef}
            patient={patient}
            responses={responses}
            clinicName="Clínica"
          />
        )}
      </div>
      
      {/* Action Buttons */}
      {patient && responses.length > 0 && (
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Relatório Completo
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
      {responses.map((response, index) => {
        const StatusIcon = getStatusIcon(response.status);
        const isExpanded = expandedItems.includes(response.id);
        const hasDetailedSteps = response.allSteps && response.allSteps.length > 0;

        return (
          <div key={response.id} className="relative">
            {/* Timeline line */}
            {index < responses.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            )}
            
            <Card className="bg-white/50 dark:bg-[#0E0E0E]/50 border-l-4 border-l-primary ml-0">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center flex-shrink-0 ${
                    response.status === 'completed' 
                      ? 'from-green-500 to-green-600' 
                      : response.status === 'in_progress'
                      ? 'from-blue-500 to-blue-600'
                      : 'from-yellow-500 to-yellow-600'
                  }`}>
                    <StatusIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {response.flowName}
                        </h5>
                        <p className="text-sm text-primary font-medium">
                          {response.stepTitle}
                        </p>
                      </div>
                      {getStatusBadge(response.status, response.progress, response.completedSteps, response.totalSteps)}
                    </div>
                    
                    {/* Progress Bar */}
                    {response.totalSteps > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progresso</span>
                          <span>{response.completedSteps}/{response.totalSteps} etapas</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${response.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Summary Response */}
                    <div className="bg-gray-50 dark:bg-[#0E0E0E]/50 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {response.response}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {response.startedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Iniciado: {format(new Date(response.startedAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                        </div>
                      )}
                      {response.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Finalizado: {format(new Date(response.completedAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Expandable detailed responses */}
              {hasDetailedSteps && (
                <CardContent className="pt-0">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(response.id)}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between p-2 h-auto font-medium text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Ver Respostas Detalhadas ({response.allSteps?.length || 0} respostas)
                        </span>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {renderStepDetails(response.allSteps || [])}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              )}
            </Card>
          </div>
        );
      })}
      
      {responses.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
            Nenhuma resposta encontrada
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Este paciente ainda não respondeu a nenhum formulário.
          </p>
        </div>
      )}
      </div>
    </>
  );
};