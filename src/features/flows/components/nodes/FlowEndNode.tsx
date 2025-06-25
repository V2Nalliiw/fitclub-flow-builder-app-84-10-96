
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

export const FlowEndNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-red-500 text-white border-2 border-red-600 min-w-[150px]">
      <div className="flex items-center gap-2">
        <Square className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
};
