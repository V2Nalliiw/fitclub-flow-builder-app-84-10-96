
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, MessageSquare, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { NodeActions } from '../NodeActions';
import { useFormIntegration } from '../../hooks/useFormIntegration';

interface FormSelectNodeData extends Record<string, unknown> {
  label: string;
  formId?: string;
  formName?: string;
  formTitle?: string;
  formDescription?: string;
  autoSend?: boolean;
  sendToWhatsApp?: boolean;
  whatsAppMessage?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormSelectNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected 
}) => {
  const nodeData = data as FormSelectNodeData;
  const { getFormById, generateFormUrl, getExecutionResult } = useFormIntegration();
  
  const form = nodeData.formId ? getFormById(nodeData.formId) : null;
  const executionResult = getExecutionResult(id);
  const isConfigured = !!(nodeData.formId && form);
  const formUrl = nodeData.formId ? generateFormUrl(nodeData.formId) : '';

  const handlePreviewForm = () => {
    if (formUrl) {
      window.open(formUrl, '_blank');
    }
  };

  const getStatusIcon = () => {
    if (!isConfigured) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    if (executionResult) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Database className="h-4 w-4 text-indigo-600" />;
  };

  const getStatusText = () => {
    if (!isConfigured) return 'Configurar';
    if (executionResult) return 'Executado';
    return 'Ativo';
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <Card className={`w-52 h-44 transition-all duration-200 border-2 ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(99,102,241,0.3),0_8px_25px_rgba(99,102,241,0.2)] border-indigo-400' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-indigo-200 dark:border-indigo-800'
      } ${!isConfigured ? 'border-orange-200 dark:border-orange-800' : ''}`}
      style={{
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      }}>
        {/* Header tecnológico */}
        <CardHeader className="pb-2 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-xs font-semibold tracking-tight">Formulário Selecionado</CardTitle>
            </div>
            <Badge 
              variant={isConfigured ? 'default' : 'secondary'} 
              className={`text-[10px] px-2 py-0.5 ${
                isConfigured 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-orange-100 text-orange-800 border-orange-200'
              }`}
            >
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-4 flex-1 flex flex-col">
          {isConfigured && form ? (
            <>
              <div className="flex-1">
                <div className="font-medium text-xs text-foreground mb-1">
                  {nodeData.formName || form.name}
                </div>
                {nodeData.formDescription && (
                  <div className="text-[10px] text-muted-foreground line-clamp-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                    {nodeData.formDescription}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-md">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {form.fields.length} campos
                </span>
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {form.responses} respostas
                </span>
              </div>

              {nodeData.sendToWhatsApp && (
                <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <MessageSquare className="h-3 w-3" />
                  <span>Envio automático</span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewForm}
                className="text-[10px] h-6 px-3 w-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:bg-indigo-900/30"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Visualizar Formulário
              </Button>

              {executionResult && (
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-indigo-100 dark:border-indigo-800">
                  ✓ Executado em {new Date(executionResult.executedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 flex-1 flex flex-col justify-center">
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Formulário não configurado
              </div>
              <div className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
                Clique duas vezes para configurar
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-indigo-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-indigo-500 border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
      
      <NodeActions
        nodeId={id}
        nodeType="formSelect"
        onDelete={nodeData.onDelete}
        onDuplicate={nodeData.onDuplicate}
        visible={selected}
      />
    </div>
  );
};
