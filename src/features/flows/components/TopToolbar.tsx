
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Eraser, LayoutGrid, Settings, Expand, Minimize } from 'lucide-react';
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
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
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
  onToggleFullscreen,
  isFullscreen = false,
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
            className="h-8 w-8 p-0"
            title="Organizar nós automaticamente"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={onClearAllNodes}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
            title="Limpar todos os nós"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          {onToggleFullscreen && (
            <Button
              onClick={onToggleFullscreen}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Sair da tela cheia" : "Expandir para tela cheia"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            onClick={onPreviewFlow}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Visualizar fluxo"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={onSaveFlow}
            size="sm"
            className="h-8 w-8 p-0"
            title="Salvar fluxo"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
