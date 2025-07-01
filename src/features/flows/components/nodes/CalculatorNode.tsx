
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calculator } from 'lucide-react';

interface CalculatorNodeProps {
  data: {
    label: string;
    calculatorFields?: any[];
    formula?: string;
  };
}

const CalculatorNode: React.FC<CalculatorNodeProps> = ({ data }) => {
  const fieldCount = data.calculatorFields?.length || 0;
  const hasFormula = data.formula && data.formula.trim().length > 0;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-200 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-16 !bg-orange-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="h-4 w-4 text-orange-600" />
        <div className="text-orange-800 font-bold text-sm">Calculadora</div>
      </div>
      
      <div className="text-gray-700 text-xs mb-2">{data.label}</div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>📝 {fieldCount} campos</div>
        {hasFormula && <div>🧮 Fórmula configurada</div>}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-16 !bg-orange-400" />
    </div>
  );
};

export default CalculatorNode;
