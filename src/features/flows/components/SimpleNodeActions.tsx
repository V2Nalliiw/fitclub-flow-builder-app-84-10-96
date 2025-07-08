
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Copy } from 'lucide-react';

interface SimpleNodeActionsProps {
  nodeId: string;
  nodeType?: string;
  onDelete?: (nodeId: string) => void;
  onEdit?: () => void;
  onDuplicate?: (nodeId: string) => void;
  show?: boolean;
}

export const SimpleNodeActions: React.FC<SimpleNodeActionsProps> = ({
  nodeId,
  nodeType,
  onDelete,
  onEdit,
  onDuplicate,
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Edit button clicked for node:', nodeId);
    
    if (!onEdit) {
      console.error('onEdit function not available');
      return;
    }

    onEdit();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Duplicate button clicked for node:', nodeId);
    
    if (!onDuplicate) {
      console.error('onDuplicate function not available');
      return;
    }

    onDuplicate(nodeId);
  };

  return (
    <div 
      className="absolute -top-3 -right-3 z-50 flex gap-1"
      style={{ pointerEvents: 'all' }}
    >
      {/* Botão de Editar */}
      <Button
        size="sm"
        variant="secondary"
        className="w-6 h-6 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={handleEdit}
        title="Editar nó"
        type="button"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      {/* Botão de Duplicar */}
      <Button
        size="sm"
        variant="outline"
        className="w-6 h-6 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={handleDuplicate}
        title="Duplicar nó"
        type="button"
      >
        <Copy className="h-3 w-3" />
      </Button>
      
      {/* Botão de Deletar */}
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
