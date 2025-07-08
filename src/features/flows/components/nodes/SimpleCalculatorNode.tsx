import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleCalculatorNodeProps {
  data: {
    label: string;
    operacao?: string;
    camposReferenciados?: string[];
    resultLabel?: string;
    onDelete?: (nodeId: string) => void;
    onEdit?: () => void;
  };
  id: string;
  selected?: boolean;
}

const SimpleCalculatorNode: React.FC<SimpleCalculatorNodeProps> = ({ data, id, selected }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onEdit) {
      data.onEdit();
    }
  };

  const campos = data.camposReferenciados || [];
  const operacao = data.operacao || '';

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-52 min-h-32 rounded-xl bg-white dark:bg-none dark:bg-[#0E0E0E]/90 border border-gray-200 dark:border-[#1A1A1A] shadow-sm transition-all duration-200 relative overflow-visible ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-[#1A1A1A]'
      }`}>
        {/* Header Section */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Cálculo Simples</span>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 hover:bg-primary/20"
            >
              <Settings className="h-3 w-3 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-800"
            >
              <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-[#1A1A1A]"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2 space-y-2">
          {operacao && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Operação:</span>
              <div className="mt-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 font-mono">
                {operacao}
              </div>
            </div>
          )}
          
          {campos.length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Campos:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {campos.map((campo, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                  >
                    {campo}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {data.resultLabel && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Resultado: {data.resultLabel}
            </div>
          )}
        </div>
      </div>
      
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

export default SimpleCalculatorNode;