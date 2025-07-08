
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Timer } from 'lucide-react';
import { SimpleNodeActions } from '../SimpleNodeActions';

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
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-36 h-20 rounded-xl bg-white dark:bg-none dark:bg-[#0E0E0E]/90 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Aguardar</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Timer className="h-3 w-3" />
            <span>{getTimeLabel()}</span>
          </div>
        </div>
      </div>
      
      <SimpleNodeActions
        nodeId={id}
        nodeType="delay"
        onDelete={data?.onDelete}
        onEdit={data?.onEdit}
        show={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
