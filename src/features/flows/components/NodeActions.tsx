
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NodeActionsProps {
  nodeId: string;
  nodeType?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  visible?: boolean;
}

export const NodeActions: React.FC<NodeActionsProps> = ({
  nodeId,
  nodeType,
  onDelete,
  onDuplicate,
  visible = false,
}) => {
  const isMobile = useIsMobile();

  console.log('NodeActions render:', {
    nodeId,
    nodeType,
    visible,
    hasOnDelete: !!onDelete,
    hasOnDuplicate: !!onDuplicate
  });

  // Don't show actions if not visible
  if (!visible) {
    return null;
  }

  const buttonSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';
  const iconSize = isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Delete button clicked for node:', nodeId, 'type:', nodeType);
    
    if (!onDelete || typeof onDelete !== 'function') {
      console.error('onDelete function not available for node:', nodeId);
      return;
    }

    // Don't allow deleting the start node
    if (nodeType === 'start') {
      console.log('Cannot delete start node');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja remover este nó?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmDelete) {
      console.log('Confirmed - executing node delete:', nodeId);
      try {
        onDelete(nodeId);
        console.log('Delete executed successfully');
      } catch (error) {
        console.error('Error executing delete:', error);
      }
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Duplicate button clicked for node:', nodeId, 'type:', nodeType);
    
    if (!onDuplicate || typeof onDuplicate !== 'function') {
      console.error('onDuplicate function not available for node:', nodeId);
      return;
    }

    // Don't allow duplicating the start node
    if (nodeType === 'start') {
      console.log('Cannot duplicate start node');
      return;
    }

    console.log('Executing node duplicate:', nodeId);
    try {
      onDuplicate(nodeId);
      console.log('Duplicate executed successfully');
    } catch (error) {
      console.error('Error executing duplicate:', error);
    }
  };

  const showDeleteButton = onDelete && nodeType !== 'start';
  const showDuplicateButton = onDuplicate && nodeType !== 'start';

  console.log('Button visibility:', {
    showDeleteButton,
    showDuplicateButton,
    nodeType
  });

  return (
    <div 
      className="absolute -top-2 -right-2 flex gap-1 opacity-100 transition-opacity duration-200 z-50"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Duplicate button - don't show for start node */}
      {showDuplicateButton && (
        <Button
          size="sm"
          variant="secondary"
          className={`${buttonSize} p-0 rounded-full shadow-md hover:scale-110 transition-transform bg-blue-500 hover:bg-blue-600 text-white border-blue-600`}
          onClick={handleDuplicate}
          onMouseDown={(e) => e.stopPropagation()}
          title="Duplicar nó"
          type="button"
          style={{ pointerEvents: 'auto' }}
        >
          <Copy className={iconSize} />
        </Button>
      )}
      
      {/* Delete button - don't show for start node */}
      {showDeleteButton && (
        <Button
          size="sm"
          variant="destructive"
          className={`${buttonSize} p-0 rounded-full shadow-md hover:scale-110 transition-transform`}
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
          title="Excluir nó"
          type="button"
          style={{ pointerEvents: 'auto' }}
        >
          <Trash2 className={iconSize} />
        </Button>
      )}
    </div>
  );
};
