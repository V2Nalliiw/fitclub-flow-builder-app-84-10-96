
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
    
    console.log('Edge delete button clicked:', {
      edgeId: id,
      currentEdgesCount: 'checking removal'
    });
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja desconectar estes nós?\n\nEsta ação não pode ser desfeita.'
    );
    
    if (confirmDelete) {
      console.log('Confirmado - removendo edge:', id);
      setEdges((edges) => {
        const filteredEdges = edges.filter((edge) => edge.id !== id);
        console.log('Edges após remoção:', filteredEdges.length);
        return filteredEdges;
      });
    }
  };

  const shouldShowButton = selected || isHovered;

  console.log('DeleteEdgeButton render:', {
    edgeId: id,
    isHovered,
    selected,
    shouldShowButton
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={style}
        onMouseEnter={() => {
          console.log('Edge mouse enter:', id);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          console.log('Edge mouse leave:', id);
          setIsHovered(false);
        }}
      />
      {shouldShowButton && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-all z-20"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <button
              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 text-xs shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110"
              onClick={onEdgeClick}
              title="Desconectar"
              type="button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
