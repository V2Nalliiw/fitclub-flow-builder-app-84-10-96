
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Eraser } from 'lucide-react';
import { Node } from '@xyflow/react';

interface FlowBuilderToolbarProps {
  selectedNode: Node | null;
  onDeleteNode: (nodeId: string) => void;
  onClearAllNodes: () => void;
}

export const FlowBuilderToolbar: React.FC<FlowBuilderToolbarProps> = ({
  selectedNode,
  onDeleteNode,
  onClearAllNodes,
}) => {
  return (
    <div className="pt-4 border-t">
      <Label className="text-sm font-medium mb-3 block">Gerenciar Nós</Label>
      <div className="space-y-2">
        {selectedNode && selectedNode.type !== 'start' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteNode(selectedNode.id)}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Excluir Nó Selecionado
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAllNodes}
          className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <Eraser className="h-3 w-3 mr-2" />
          Limpar Todos os Nós
        </Button>
      </div>
    </div>
  );
};
