
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Flag, MessageCircle } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface EndNodeProps {
  data: any;
  selected?: boolean;
  id: string;
}

export const EndNode: React.FC<EndNodeProps> = ({ data, selected, id }) => {
  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-36 h-20 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Flag className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Fim do Fluxo</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2">
          {data.mensagemFinal ? (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <MessageCircle className="h-3 w-3" />
              <span>Com mensagem</span>
            </div>
          ) : (
            <div className="text-xs text-gray-600 dark:text-gray-400">Sem mensagem</div>
          )}
        </div>
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="end"
        onDelete={data.onDelete}
        onDuplicate={data.onDuplicate}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
