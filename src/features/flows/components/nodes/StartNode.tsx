
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
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 transition-all duration-200 min-w-[160px] ${
      selected ? 'border-primary shadow-lg scale-105' : ''
    }`}>
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5 text-[#5D8701]" />
        <div className="text-sm font-medium">Início do Fluxo</div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Execução automática
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
        className="w-3 h-3 bg-[#5D8701] border-2 border-white"
      />
    </div>
  );
};
