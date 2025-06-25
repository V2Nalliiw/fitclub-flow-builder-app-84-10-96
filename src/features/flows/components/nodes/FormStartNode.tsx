
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, MessageSquare } from 'lucide-react';

export const FormStartNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-blue-500 text-white border-2 border-blue-600 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90">
        <MessageSquare className="h-3 w-3" />
        <span>Envia WhatsApp</span>
      </div>
      
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
