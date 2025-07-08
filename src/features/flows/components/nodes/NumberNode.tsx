import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Hash } from 'lucide-react';
import { SimpleNodeActions } from '../SimpleNodeActions';
import { NodeHelpButton } from '@/components/ui/node-help-button';

interface NumberNodeProps {
  data: {
    label: string;
    pergunta?: string;
    nomenclatura?: string;
    prefixo?: string;
    sufixo?: string;
    tipoNumero?: 'inteiro' | 'decimal';
    onDelete?: (nodeId: string) => void;
    onEdit?: () => void;
    onDuplicate?: (nodeId: string) => void;
  };
  id: string;
  selected?: boolean;
}

const NumberNode: React.FC<NumberNodeProps> = ({ data, id, selected }) => {

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-48 min-h-28 rounded-xl bg-white dark:bg-[#0E0E0E]/90 border border-gray-200 dark:border-[#1A1A1A] shadow-sm transition-all duration-200 relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-[#1A1A1A]'
      }`}>
        {/* Header Section */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Número</span>
          </div>
          <NodeHelpButton nodeType="number" />
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2 space-y-2">
          {data.pergunta && (
            <div className="text-xs text-gray-900 dark:text-gray-100 font-medium">
              "{data.pergunta}"
            </div>
          )}
          
          {data.nomenclatura && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Var:</span> {data.nomenclatura}
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>Tipo:</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {data.tipoNumero || 'inteiro'}
            </span>
          </div>
          
          {(data.prefixo || data.sufixo) && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Formato: {data.prefixo || ''}[número]{data.sufixo || ''}
            </div>
          )}
        </div>
      </div>
      
      <SimpleNodeActions
        nodeId={id}
        nodeType="number"
        onDelete={data?.onDelete}
        onEdit={data?.onEdit}
        onDuplicate={data?.onDuplicate}
        show={selected}
      />
      
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      
      {/* Handle de saída */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};

export default NumberNode;