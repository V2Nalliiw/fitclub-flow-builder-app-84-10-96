
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';

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
  if (!visible || nodeType === 'start' || !onDelete || !onDuplicate) {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        size="sm"
        variant="destructive"
        className="h-6 w-6 p-0 rounded-full shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(nodeId);
        }}
        title="Excluir nó"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="h-6 w-6 p-0 rounded-full shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(nodeId);
        }}
        title="Duplicar nó"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};
