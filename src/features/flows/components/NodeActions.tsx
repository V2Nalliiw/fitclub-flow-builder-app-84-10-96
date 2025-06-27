
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

  // Não mostrar ações se não há funcões definidas ou se não estiver visível
  if (!visible || !onDelete || !onDuplicate) {
    return null;
  }

  const buttonSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';
  const iconSize = isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(nodeId);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDuplicate(nodeId);
  };

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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
      <Button
        size="sm"
        variant="secondary"
        className={`${buttonSize} p-0 rounded-full shadow-md hover:scale-110 transition-transform`}
        onClick={handleDuplicate}
        title="Duplicar nó"
        type="button"
      >
        <Copy className={iconSize} />
      </Button>
    </div>
  );
};
