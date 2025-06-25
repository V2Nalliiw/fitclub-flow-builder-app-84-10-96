
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const FlowStartNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#5D8701] text-white border-2 border-[#4a6e01] min-w-[150px]">
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-[#5D8701] border-2 border-white"
      />
    </div>
  );
};
