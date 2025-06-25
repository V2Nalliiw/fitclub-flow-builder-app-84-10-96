
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-[#5D8701] text-white border-2 transition-all duration-200 min-w-[160px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-[#4a6e01]'
    }`}>
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5" />
        <div className="text-sm font-medium">Início do Fluxo</div>
      </div>
      <div className="text-xs opacity-90 mt-1">
        Execução automática
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-[#5D8701] border-2 border-white"
      />
    </div>
  );
};
