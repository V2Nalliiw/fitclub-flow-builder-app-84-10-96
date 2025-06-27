
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SimpleNodeActionsProps {
  nodeId: string;
  nodeType?: string;
  onDelete?: (nodeId: string) => void;
  show?: boolean;
}

export const SimpleNodeActions: React.FC<SimpleNodeActionsProps> = ({
  nodeId,
  nodeType,
  onDelete,
  show = false,
}) => {
  console.log('SimpleNodeActions render:', {
    nodeId,
    nodeType,
    show,
    hasOnDelete: !!onDelete
  });

  // Não mostrar para o nó start
  if (nodeType === 'start' || !show) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Delete button clicked for node:', nodeId);
    
    if (!onDelete) {
      console.error('onDelete function not available');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja remover este nó?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmDelete) {
      console.log('Confirmed - executing delete:', nodeId);
      onDelete(nodeId);
    }
  };

  return (
    <div 
      className="absolute -top-3 -right-3 z-50"
      style={{ pointerEvents: 'all' }}
    >
      <Button
        size="sm"
        variant="destructive"
        className="w-6 h-6 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={handleDelete}
        title="Excluir nó"
        type="button"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
