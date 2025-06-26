
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Send } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface FormStartNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormStartNode: React.FC<FormStartNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  return (
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-blue-500 text-white border-2 transition-all duration-200 min-w-[200px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-blue-600'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-5 w-5" />
        <div className="text-sm font-medium">
          {data.titulo || 'Início de Formulário'}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
        <Send className="h-3 w-3" />
        <span>Envia WhatsApp com link</span>
      </div>
      {data.descricao && (
        <div className="text-xs opacity-80 truncate">
          {data.descricao}
        </div>
      )}
      
      <NodeActions
        nodeId={id}
        nodeType="formStart"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={true}
      />
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};
