
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface StartNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const StartNode: React.FC<StartNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-28 h-28 rounded-[15px] bg-white border shadow-sm transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200'
      }`}>
        <Play className="h-6 w-6 mb-1 text-[#5D8701]" fill="currentColor" />
        <div className="text-xs font-semibold text-center text-[#5D8701] tracking-tight">
          Início
        </div>
        <div className="text-[10px] text-gray-500 text-center font-medium">
          Automático
        </div>
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="start"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
