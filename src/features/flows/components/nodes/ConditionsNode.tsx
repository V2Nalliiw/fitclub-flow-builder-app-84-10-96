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
    <div className="px-4 py-3 shadow-md rounded-lg bg-white dark:bg-none dark:bg-[#0E0E0E] border-2 border-border min-w-[220px] relative group">
      {/* Handle de entrada centralizado na borda esquerda */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 !bg-primary !left-0 !transform !-translate-x-1/2 !top-1/2 !-translate-y-1/2" 
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <div className="text-primary font-bold text-sm">Condições</div>
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
      
      <div className="text-gray-700 dark:text-gray-300 text-xs mb-3 font-medium">{data.label}</div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
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
              className="flex items-center gap-2 text-xs p-1 bg-muted/50 rounded border"
            >
              <div 
                className="w-2 h-2 rounded-full bg-primary"
              />
              <span className="truncate flex-1" title={condition.label}>
                {condition.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Handles de saída alinhados na borda direita do card */}
      {conditions.map((condition, index) => {
        const totalConditions = conditions.length;
        const cardHeight = 140; // altura aproximada do card
        const handleSpacing = Math.min(32, cardHeight / (totalConditions + 1));
        const startY = -(cardHeight / 2) + (handleSpacing * 2);
        const offsetY = startY + (index * handleSpacing);
        
        return (
          <React.Fragment key={condition.id || index}>
            <Handle
              type="source"
              position={Position.Right}
              id={`condition-${index}`}
              className="!w-3 !h-3 !border-2 !border-white !shadow-md !right-0 !transform !translate-x-1/2"
              style={{
                top: `calc(50% + ${offsetY}px)`,
                backgroundColor: `hsl(var(--primary))`,
                zIndex: 10,
              }}
            />
            
            {/* Tooltip para identificar a condição */}
            <div
              className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black dark:bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{
                right: '-10px',
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(100%, -50%)',
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
          position={Position.Right} 
          className="w-3 h-3 !bg-primary !right-0 !transform !translate-x-1/2 !top-1/2 !-translate-y-1/2" 
        />
      )}
    </div>
  );
};

export default ConditionsNode;