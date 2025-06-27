
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

  // Não mostrar ações se não estiver visível
  if (!visible) {
    return null;
  }

  const buttonSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';
  const iconSize = isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Delete button clicked:', {
      nodeId,
      nodeType,
      hasOnDelete: !!onDelete
    });
    
    if (!onDelete || typeof onDelete !== 'function') {
      console.error('Função onDelete não está disponível para o nó:', nodeId);
      return;
    }

    // Não permitir deletar o nó inicial
    if (nodeType === 'start') {
      console.log('Não é possível deletar o nó inicial');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja remover este nó?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmDelete) {
      console.log('Executando delete do nó:', nodeId);
      onDelete(nodeId);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Duplicate button clicked:', {
      nodeId,
      nodeType,
      hasOnDuplicate: !!onDuplicate
    });
    
    if (!onDuplicate || typeof onDuplicate !== 'function') {
      console.error('Função onDuplicate não está disponível para o nó:', nodeId);
      return;
    }

    // Não permitir duplicar o nó inicial
    if (nodeType === 'start') {
      console.log('Não é possível duplicar o nó inicial');
      return;
    }

    console.log('Executando duplicate do nó:', nodeId);
    onDuplicate(nodeId);
  };

  const showDeleteButton = onDelete && nodeType !== 'start';
  const showDuplicateButton = onDuplicate && nodeType !== 'start';

  console.log('Button visibility:', {
    showDeleteButton,
    showDuplicateButton
  });

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
      {/* Botão de duplicar - não mostrar para nó inicial */}
      {showDuplicateButton && (
        <Button
          size="sm"
          variant="secondary"
          className={`${buttonSize} p-0 rounded-full shadow-md hover:scale-110 transition-transform bg-blue-500 hover:bg-blue-600 text-white border-blue-600`}
          onClick={handleDuplicate}
          title="Duplicar nó"
          type="button"
        >
          <Copy className={iconSize} />
        </Button>
      )}
      
      {/* Botão de deletar - não mostrar para nó inicial */}
      {showDeleteButton && (
        <Button
          size="sm"
          variant="destructive"
          className={`${buttonSize} p-0 rounded-full shadow-md hover:scale-110 transition-transform`}
          onClick={handleDelete}
          title="Excluir nó"
          type="button"
        >
          <Trash2 className={iconSize} />
        </Button>
      )}
    </div>
  );
};
