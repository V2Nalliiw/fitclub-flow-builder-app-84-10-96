
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
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
    return <FileText className="h-4 w-4 text-blue-600" />;
  };

  const getStatusText = () => {
    if (!isConfigured) return 'Não configurado';
    if (executionResult) return 'Executado';
    return 'Configurado';
  };

  return (
    <div className="group relative">
      <Card className={`w-48 h-40 transition-all duration-200 ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      } ${!isConfigured ? 'border-orange-200' : ''}`}>
        <CardHeader className="pb-2 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-xs">Formulário Selecionado</CardTitle>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 p-3 pt-0">
          {isConfigured && form ? (
            <div className="space-y-2">
              <div>
                <div className="font-medium text-xs text-foreground">
                  {nodeData.formName || form.name}
                </div>
                {nodeData.formDescription && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {nodeData.formDescription}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{form.fields.length} campos</span>
                <span>•</span>
                <span>{form.responses} respostas</span>
              </div>

              {nodeData.sendToWhatsApp && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <MessageSquare className="h-3 w-3" />
                  <span>Envio por WhatsApp</span>
                </div>
              )}

              <div className="flex gap-1 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewForm}
                  className="text-xs h-6 px-2 flex-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              </div>

              {executionResult && (
                <div className="text-xs text-muted-foreground pt-1 border-t">
                  Executado em {new Date(executionResult.executedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="text-xs text-muted-foreground mb-2">
                Configure este nó para selecionar um formulário
              </div>
              <div className="text-xs text-orange-600">
                Clique duas vezes para configurar
              </div>
            </div>
          )}
        </CardContent>
        
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-border border-2 border-background"
          style={{ background: '#555' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-border border-2 border-background"
          style={{ background: '#555' }}
        />
      </Card>
      
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
