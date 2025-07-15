
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calculator, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorNodeProps {
  data: {
    label: string;
    calculatorFields?: any[];
    calculatorQuestionFields?: any[];
    formula?: string;
    onDelete?: (nodeId: string) => void;
    onEdit?: () => void;
  };
  id: string;
}

const CalculatorNode: React.FC<CalculatorNodeProps> = ({ data, id }) => {
  const calculatorFieldCount = data.calculatorFields?.length || 0;
  const questionFieldCount = data.calculatorQuestionFields?.length || 0;
  const hasFormula = data.formula && data.formula.trim().length > 0;

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

  return (
    <div className="px-4 py-3 shadow-md rounded-lg bg-white dark:bg-none dark:bg-[#0E0E0E] border-2 border-orange-200 dark:border-orange-700 min-w-[200px] relative group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-orange-400" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <div className="text-orange-800 dark:text-orange-200 font-bold text-sm">Calculadora</div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
          >
            <Settings className="h-3 w-3 text-orange-600 dark:text-orange-300" />
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
      
      <div className="text-gray-700 dark:text-gray-300 text-xs mb-2 font-medium">{data.label}</div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-1">
          <span>🧮</span>
          <span>{calculatorFieldCount} cálculos</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❓</span>
          <span>{questionFieldCount} perguntas</span>
        </div>
        {hasFormula && (
          <div className="flex items-center gap-1">
            <span>🧮</span>
            <span>Fórmula configurada</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-orange-400" />
    </div>
  );
};

export default CalculatorNode;
