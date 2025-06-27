
import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

export const DeleteEdgeButton: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    console.log('Removendo edge:', id);
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {(selected || isHovered) && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-all z-20"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <button
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 text-xs shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110"
              onClick={onEdgeClick}
              title="Desconectar"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
