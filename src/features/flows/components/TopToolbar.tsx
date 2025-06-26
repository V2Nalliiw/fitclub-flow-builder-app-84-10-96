
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Trash2, Settings } from 'lucide-react';
import { Node } from '@xyflow/react';

interface TopToolbarProps {
  flowName: string;
  selectedNode: Node | null;
  onFlowNameChange: (name: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClearAllNodes: () => void;
  onSaveFlow: () => void;
  onPreviewFlow: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  flowName,
  selectedNode,
  onFlowNameChange,
  onDeleteNode,
  onClearAllNodes,
  onSaveFlow,
  onPreviewFlow,
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-card rounded-lg shadow-lg border p-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <Input
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            className="w-48 h-8 text-sm"
            placeholder="Nome do fluxo..."
          />
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center space-x-2">
          {selectedNode && selectedNode.type !== 'start' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          )}
          
          <Button
            onClick={onPreviewFlow}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <Eye className="h-3 w-3 mr-1" />
            Visualizar
          </Button>
          
          <Button
            onClick={onSaveFlow}
            size="sm"
            className="h-8"
          >
            <Save className="h-3 w-3 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};
