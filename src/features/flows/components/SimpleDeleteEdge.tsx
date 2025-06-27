
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

export const SimpleDeleteEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label = 'Conexão',
}) => {
  const { setEdges } = useReactFlow();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Edge delete clicked:', id);
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja desconectar estes nós?'
    );
    
    if (confirmDelete) {
      console.log('Removing edge:', id);
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute z-50 pointer-events-all"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 shadow-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {label}
            </span>
            <button
              className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all duration-150"
              onClick={handleDelete}
              title="Desconectar"
              type="button"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
