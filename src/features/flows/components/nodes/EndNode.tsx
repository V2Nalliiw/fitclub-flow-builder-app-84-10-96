
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Flag, MessageCircle } from 'lucide-react';
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
      <div className={`w-32 h-32 rounded-full bg-white border shadow-sm transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200'
      }`}>
        <Flag className="h-6 w-6 mb-1 text-[#5D8701]" />
        <div className="text-xs font-semibold text-center text-[#5D8701] tracking-tight">
          Fim do Fluxo
        </div>
        {data.mensagemFinal && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
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
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
