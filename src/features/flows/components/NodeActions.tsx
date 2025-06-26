
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

  if (!visible || nodeType === 'start' || !onDelete || !onDuplicate) {
    return null;
  }

  const buttonSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';
  const iconSize = isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        size="sm"
        variant="destructive"
        className={`${buttonSize} p-0 rounded-full shadow-md`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(nodeId);
        }}
        title="Excluir nó"
      >
        <Trash2 className={iconSize} />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className={`${buttonSize} p-0 rounded-full shadow-md`}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(nodeId);
        }}
        title="Duplicar nó"
      >
        <Copy className={iconSize} />
      </Button>
    </div>
  );
};
