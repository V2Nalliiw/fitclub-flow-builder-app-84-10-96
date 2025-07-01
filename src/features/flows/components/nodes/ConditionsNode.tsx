
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConditionsNodeProps {
  data: {
    label: string;
    conditions?: any[];
    onDelete?: (nodeId: string) => void;
    onEdit?: () => void;
  };
  id: string;
}

const ConditionsNode: React.FC<ConditionsNodeProps> = ({ data, id }) => {
  const conditionCount = data.conditions?.length || 0;

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
    <div className="px-4 py-3 shadow-md rounded-lg bg-white border-2 border-purple-200 min-w-[200px] relative group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-400" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-600" />
          <div className="text-purple-800 font-bold text-sm">Condições</div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-6 w-6 p-0 hover:bg-purple-100"
          >
            <Settings className="h-3 w-3 text-purple-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
      
      <div className="text-gray-700 text-xs mb-2 font-medium">{data.label}</div>
      
      <div className="text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>🔀</span>
          <span>{conditionCount} condições</span>
        </div>
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
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-400" />
      )}
    </div>
  );
};

export default ConditionsNode;
