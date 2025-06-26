
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Trash2, Settings, Eraser, LayoutGrid } from 'lucide-react';
import { Node } from '@xyflow/react';

interface TopToolbarProps {
  flowName: string;
  selectedNode: Node | null;
  onFlowNameChange: (name: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClearAllNodes: () => void;
  onAutoArrangeNodes: () => void;
  onSaveFlow: () => void;
  onPreviewFlow: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  flowName,
  selectedNode,
  onFlowNameChange,
  onDeleteNode,
  onClearAllNodes,
  onAutoArrangeNodes,
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
          <Button
            onClick={onAutoArrangeNodes}
            variant="outline"
            size="sm"
            className="h-8"
            title="Organizar nós automaticamente"
          >
            <LayoutGrid className="h-3 w-3 mr-1" />
            Organizar
          </Button>
          
          <Button
            onClick={onClearAllNodes}
            variant="outline"
            size="sm"
            className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
            title="Limpar todos os nós"
          >
            <Eraser className="h-3 w-3 mr-1" />
            Limpar
          </Button>
          
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
