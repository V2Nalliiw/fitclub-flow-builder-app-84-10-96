
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface FormSelectNodeData {
  label: string;
  formId?: string;
  formName?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormSelectNode: React.FC<NodeProps<FormSelectNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  return (
    <Card className={`min-w-[200px] transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm">Formulário Selecionado</CardTitle>
          </div>
          <NodeActions
            nodeId={id}
            onDelete={data.onDelete}
            onDuplicate={data.onDuplicate}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.formId && data.formName ? (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {data.formName}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Formulário será enviado quando o fluxo atingir este nó
            </p>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Configure este nó para selecionar um formulário
          </div>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </Card>
  );
};
