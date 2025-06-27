
import React from 'react';
import {
  BaseEdge,
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
}) => {
  const { setEdges } = useReactFlow();
  
  const [edgePath] = getBezierPath({
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
    
    console.log('Edge clicked for deletion:', id);
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja desconectar estes nós?'
    );
    
    if (confirmDelete) {
      console.log('Removing edge:', id);
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={{
        ...style,
        strokeWidth: 3,
        cursor: 'pointer',
      }}
      onClick={handleDelete}
    />
  );
};
