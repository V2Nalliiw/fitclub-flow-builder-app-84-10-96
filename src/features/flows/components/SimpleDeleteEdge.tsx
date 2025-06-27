
import React, { useState } from 'react';
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
}) => {
  const { setEdges } = useReactFlow();
  const [showButton, setShowButton] = useState(false);
  
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
        onMouseEnter={() => setShowButton(true)}
        onMouseLeave={() => setShowButton(false)}
      />
      <EdgeLabelRenderer>
        {showButton && (
          <div
            className="absolute z-50"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all'
            }}
            onMouseEnter={() => setShowButton(true)}
            onMouseLeave={() => setShowButton(false)}
          >
            <button
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform"
              onClick={handleDelete}
              title="Desconectar"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
