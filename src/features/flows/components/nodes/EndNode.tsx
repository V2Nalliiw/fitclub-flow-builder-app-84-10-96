
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square, MessageCircle } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface EndNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const EndNode: React.FC<EndNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-36 h-24 bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(239,68,68,0.3),0_8px_25px_rgba(239,68,68,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}
      style={{
        clipPath: 'polygon(8% 0%, 92% 0%, 100% 25%, 92% 100%, 8% 100%, 0% 25%)'
      }}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" 
             style={{clipPath: 'inherit'}} />
        
        <Square className="h-5 w-5 mb-1 relative z-10" />
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight">
          Fim do Fluxo
        </div>
        {data.mensagemFinal && (
          <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10">
            <MessageCircle className="h-2.5 w-2.5" />
            <span>Com mensagem</span>
          </div>
        )}
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="end"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-red-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
