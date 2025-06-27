
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';

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
          className="absolute z-50 pointer-events-all cursor-pointer"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onClick={handleDelete}
          title="Clique para desconectar"
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {label}
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
