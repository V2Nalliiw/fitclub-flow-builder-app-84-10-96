
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Timer } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface DelayNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const DelayNode: React.FC<DelayNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  const getTimeLabel = () => {
    const quantidade = data.quantidade || 1;
    const tipo = data.tipoIntervalo || 'dias';
    
    return `${quantidade} ${tipo}`;
  };

  return (
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-orange-500 text-white border-2 transition-all duration-200 min-w-[160px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-orange-600'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-5 w-5" />
        <div className="text-sm font-medium">Aguardar</div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90">
        <Timer className="h-3 w-3" />
        <span>{getTimeLabel()}</span>
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="delay"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={true}
      />
      
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
