
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionsNodeProps {
  data: {
    label: string;
    conditions?: any[];
  };
}

const ConditionsNode: React.FC<ConditionsNodeProps> = ({ data }) => {
  const conditionCount = data.conditions?.length || 0;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-200 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-16 !bg-purple-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="h-4 w-4 text-purple-600" />
        <div className="text-purple-800 font-bold text-sm">Condições</div>
      </div>
      
      <div className="text-gray-700 text-xs mb-2">{data.label}</div>
      
      <div className="text-xs text-gray-500">
        <div>🔀 {conditionCount} condições</div>
      </div>

      {/* Handles dinâmicos para cada condição */}
      {data.conditions?.map((condition, index) => (
        <Handle
          key={condition.id || index}
          type="source"
          position={Position.Bottom}
          id={`condition-${index}`}
          style={{
            left: `${25 + (index * 30)}%`,
            background: '#a855f7',
          }}
          className="!w-3 !h-3"
        />
      ))}
      
      {/* Handle padrão se não há condições */}
      {conditionCount === 0 && (
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-purple-400" />
      )}
    </div>
  );
};

export default ConditionsNode;
