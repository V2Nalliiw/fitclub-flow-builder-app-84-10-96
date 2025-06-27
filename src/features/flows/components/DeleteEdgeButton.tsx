
import React from 'react';
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

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Edge delete button clicked:', {
      edgeId: id,
      event: 'delete_button_clicked'
    });
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja desconectar estes nós?\n\nEsta ação não pode ser desfeita.'
    );
    
    if (confirmDelete) {
      console.log('Confirmed - removing edge:', id);
      setEdges((edges) => {
        const filteredEdges = edges.filter((edge) => edge.id !== id);
        console.log('Edges after removal:', {
          removedEdgeId: id,
          remainingEdges: filteredEdges.length
        });
        return filteredEdges;
      });
    } else {
      console.log('Removal cancelled by user');
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
          className="absolute z-50"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'auto'
          }}
        >
          <button
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg border border-white hover:scale-110"
            onClick={onEdgeClick}
            onMouseDown={(e) => e.stopPropagation()}
            title="Desconectar"
            type="button"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
