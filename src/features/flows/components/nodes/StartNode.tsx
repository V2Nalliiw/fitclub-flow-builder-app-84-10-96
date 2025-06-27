
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
      <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#5D8701]/80 to-[#4a6e01]/80 backdrop-blur-sm shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden border border-[#5D8701]/20 ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(93,135,1,0.3),0_8px_25px_rgba(93,135,1,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/10" />
        
        <Play className="h-6 w-6 mb-1 relative z-10" fill="currentColor" />
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight">
          Início
        </div>
        <div className="text-[10px] opacity-80 text-center relative z-10 font-medium">
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
