
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Eraser, LayoutGrid, Settings, Expand, Minimize } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const toolbarClasses = isMobile 
    ? 'fixed top-[calc(4rem+2%)] left-1/2 transform -translate-x-1/2 z-40 bg-card rounded-lg shadow-lg border p-2 w-[calc(100vw-2rem)] max-w-sm'
    : `absolute top-[4%] left-1/2 transform -translate-x-1/2 z-40 bg-card rounded-lg shadow-lg border p-2 w-[calc(100vw-2rem)] max-w-2xl ${isFullscreen ? 'fixed' : ''}`;

  return (
    <div className={toolbarClasses}>
      <div className="flex items-center gap-2 md:gap-4 justify-center">
        <div className="flex items-center gap-1 md:gap-2 min-w-0">
          <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
          <Input
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            className="w-24 md:w-48 h-7 md:h-8 text-xs md:text-sm min-w-0"
            placeholder="Nome do fluxo..."
          />
        </div>
        
        <div className="h-4 md:h-6 w-px bg-border flex-shrink-0" />
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button
            onClick={onAutoArrangeNodes}
            variant="outline"
            size="sm"
            className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 hover:bg-accent"
            title="Organizar nós automaticamente"
          >
            <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          
          <Button
            onClick={onClearAllNodes}
            variant="outline"
            size="sm"
            className="h-7 w-7 md:h-8 md:w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 flex-shrink-0"
            title="Limpar todos os nós"
          >
            <Eraser className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          
          {onToggleFullscreen && !isMobile && (
            <Button
              onClick={onToggleFullscreen}
              variant="outline"
              size="sm"
              className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 hover:bg-accent"
              title={isFullscreen ? "Sair da tela cheia" : "Expandir para tela cheia"}
            >
              {isFullscreen ? <Minimize className="h-3 w-3 md:h-4 md:w-4" /> : <Expand className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
          )}
          
          <Button
            onClick={onPreviewFlow}
            variant="outline"
            size="sm"
            className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 hover:bg-accent"
            title="Visualizar fluxo"
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          
          <Button
            onClick={onSaveFlow}
            size="sm"
            className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
            title="Salvar fluxo"
          >
            <Save className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
