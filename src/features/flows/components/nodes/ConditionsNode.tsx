
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
  const conditions = data.conditions || [];
  const conditionCount = conditions.length;

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
    <div className="px-4 py-3 shadow-md rounded-lg bg-white border-2 border-purple-200 min-w-[220px] relative group">
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
      
      <div className="text-gray-700 text-xs mb-3 font-medium">{data.label}</div>
      
      <div className="text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <span>🔀</span>
          <span>{conditionCount} condições configuradas</span>
        </div>
      </div>

      {/* Lista das condições com indicadores visuais */}
      {conditions.length > 0 && (
        <div className="space-y-1 mb-4">
          {conditions.map((condition, index) => (
            <div
              key={condition.id || index}
              className="flex items-center gap-2 text-xs p-1 bg-purple-50 rounded border"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `hsl(${(index * 360) / conditions.length}, 70%, 60%)` }}
              />
              <span className="truncate flex-1" title={condition.label}>
                {condition.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Handles dinâmicos para cada condição com melhor espaçamento */}
      {conditions.map((condition, index) => {
        const totalConditions = conditions.length;
        const spacing = totalConditions > 1 ? 180 / (totalConditions - 1) : 0;
        const startAngle = totalConditions > 1 ? -90 : 0;
        const angle = startAngle + (index * spacing);
        
        // Converte ângulo para posição
        const radius = 35;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        return (
          <React.Fragment key={condition.id || index}>
            <Handle
              type="source"
              position={Position.Bottom}
              id={`condition-${index}`}
              className="!w-3 !h-3 !border-2 !border-white !shadow-md"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(100% + ${y}px)`,
                backgroundColor: `hsl(${(index * 360) / conditions.length}, 70%, 60%)`,
                zIndex: 10,
              }}
            />
            
            {/* Tooltip para identificar a condição */}
            <div
              className="absolute pointer-events-none opacity-0 hover:opacity-100 transition-opacity z-20 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(100% + ${y + 20}px)`,
                transform: 'translateX(-50%)',
              }}
            >
              {condition.label}
            </div>
          </React.Fragment>
        );
      })}
      
      {/* Handle padrão se não há condições */}
      {conditionCount === 0 && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 !bg-purple-400" 
        />
      )}
    </div>
  );
};

export default ConditionsNode;
