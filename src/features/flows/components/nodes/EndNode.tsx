
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square, MessageCircle } from 'lucide-react';

export const EndNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-red-500 text-white border-2 transition-all duration-200 min-w-[160px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-red-600'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Square className="h-5 w-5" />
        <div className="text-sm font-medium">Fim do Fluxo</div>
      </div>
      {data.mensagemFinal && (
        <div className="flex items-center gap-1 text-xs opacity-90">
          <MessageCircle className="h-3 w-3" />
          <span>Com mensagem final</span>
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
};
