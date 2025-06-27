
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
      <div className={`w-40 h-32 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.3),0_8px_25px_rgba(59,130,246,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10" />
        
        <FileText className="h-6 w-6 mb-1 relative z-10" />
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
          Formulário
        </div>
        
        <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10 mb-1">
          <Send className="h-2.5 w-2.5" />
          <span>Envia WhatsApp</span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] opacity-80 relative z-10">
          <ExternalLink className="h-2.5 w-2.5" />
          <span>com link</span>
        </div>
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
