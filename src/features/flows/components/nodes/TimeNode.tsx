
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const TimeNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-orange-500 text-white border-2 border-orange-600 min-w-[160px]">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <div className="text-xs opacity-90">
        Aguardar: {data.delay || '1'} dia(s)
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  );
};
