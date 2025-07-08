import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Response {
  id: string;
  flowName: string;
  stepTitle: string;
  response: string;
  completedAt: string;
  status: string;
}

interface PatientResponsesTimelineProps {
  responses: Response[];
}

export const PatientResponsesTimeline: React.FC<PatientResponsesTimelineProps> = ({
  responses
}) => {
  return (
    <div className="space-y-4">
      {responses.map((response, index) => (
        <div key={response.id} className="relative">
          {/* Timeline line */}
          {index < responses.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          )}
          
          <Card className="bg-white/50 dark:bg-none dark:bg-[#0E0E0E]/50 border-l-4 border-l-[#5D8701] ml-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="w-12 h-12 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        {response.stepTitle}
                      </h5>
                      <p className="text-sm text-[#5D8701] font-medium">
                        {response.flowName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      Completa
                    </Badge>
                  </div>
                  
                  {/* Response content */}
                  <div className="bg-gray-50 dark:bg-none dark:bg-[#0E0E0E]/50 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {response.response}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(response.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(response.completedAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      
      {responses.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
            Nenhuma resposta encontrada
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Este paciente ainda não respondeu a nenhum formulário.
          </p>
        </div>
      )}
    </div>
  );
};