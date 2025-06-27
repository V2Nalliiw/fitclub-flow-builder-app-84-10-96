
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Send, ExternalLink } from 'lucide-react';
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
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-40 h-44 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.3),0_8px_25px_rgba(59,130,246,0.2)] border-blue-400 dark:border-blue-600' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}
      style={{
        borderRadius: '12px 12px 4px 4px'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-white" />
          <div className="text-xs font-semibold text-white tracking-tight">
            Formulário
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="text-xs font-medium text-center text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {data.titulo || 'Início de Formulário'}
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 justify-center mb-2">
            <Send className="h-3 w-3" />
            <span>Envia WhatsApp</span>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400 justify-center">
            <ExternalLink className="h-3 w-3" />
            <span>com link</span>
          </div>
        </div>
        
        {/* Footer com gradiente sutil */}
        <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="formStart"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-blue-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-blue-500 border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
