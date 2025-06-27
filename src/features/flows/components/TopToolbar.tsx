
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Eraser, LayoutGrid, Settings, Expand, Minimize, Play, Square, FormInput, FileText, Clock, HelpCircle, Plus, Minus } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useBreakpoints } from '@/hooks/use-breakpoints';

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
  onAddNode: (type: string) => void;
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
  onAddNode,
}) => {
  const { isDesktop } = useBreakpoints();
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypes = [
    { type: 'start', icon: Play, label: 'Início', color: 'text-green-600' },
    { type: 'end', icon: Square, label: 'Fim', color: 'text-red-600' },
    { type: 'formStart', icon: FormInput, label: 'Início Formulário', color: 'text-blue-600' },
    { type: 'formEnd', icon: FileText, label: 'Fim Formulário', color: 'text-purple-600' },
    { type: 'formSelect', icon: FileText, label: 'Seleção Formulário', color: 'text-indigo-600' },
    { type: 'delay', icon: Clock, label: 'Delay', color: 'text-orange-600' },
    { type: 'question', icon: HelpCircle, label: 'Pergunta', color: 'text-cyan-600' },
  ] as const;

  const handleAddNode = (type: string) => {
    onAddNode(type);
  };

  // Desktop Layout (single line)
  if (isDesktop) {
    const toolbarClasses = `absolute top-[4%] left-1/2 transform -translate-x-1/2 z-40 bg-card rounded-lg shadow-lg border p-2 w-[calc(100vw-2rem)] max-w-5xl ${isFullscreen ? 'fixed' : ''}`;

    return (
      <div className={toolbarClasses}>
        <div className="flex items-center gap-2 md:gap-4 justify-center">
          <div className="flex items-center gap-1 md:gap-2 min-w-0">
            <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              className="w-20 md:w-32 h-7 md:h-8 text-xs md:text-sm min-w-0"
              placeholder="Nome do fluxo..."
            />
          </div>
          
          <div className="h-4 md:h-6 w-px bg-border flex-shrink-0" />
          
          {/* Menu de Nós - Desktop */}
          <div className="flex items-center gap-1">
            {nodeTypes.map((node) => {
              const IconComponent = node.icon;
              return (
                <Button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 hover:bg-accent"
                  title={node.label}
                >
                  <IconComponent className={`h-3 w-3 md:h-4 md:w-4 ${node.color}`} />
                </Button>
              );
            })}
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
            
            {onToggleFullscreen && (
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
  }

  // Mobile/Tablet Layout
  if (!isExpanded) {
    // Collapsed state - single centered button
    return (
      <div className="fixed top-[calc(4rem+2%)] left-1/2 transform -translate-x-1/2 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 rounded-full shadow-lg"
          title="Expandir ferramentas"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Expanded state - full toolbar
  const toolbarClasses = 'fixed top-[calc(4rem+2%)] left-1/2 transform -translate-x-1/2 z-40 bg-card rounded-lg shadow-lg border p-3 w-[calc(100vw-1rem)] max-w-sm';

  return (
    <div className={toolbarClasses}>
      {/* Primeira Linha - Controles Principais */}
      <div className="flex items-center gap-2 justify-center mb-3">
        {/* Botão de colapsar */}
        <Button
          onClick={() => setIsExpanded(false)}
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 flex-shrink-0 hover:bg-accent"
          title="Recolher ferramentas"
        >
          <Minus className="h-3 w-3" />
        </Button>

        <div className="flex items-center gap-1 min-w-0">
          <Settings className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <Input
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            className="w-20 h-7 text-xs min-w-0"
            placeholder="Nome do fluxo..."
          />
        </div>
        
        <div className="h-4 w-px bg-border flex-shrink-0" />
        
        <div className="flex items-center space-x-1">
          <Button
            onClick={onAutoArrangeNodes}
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 flex-shrink-0 hover:bg-accent"
            title="Organizar nós automaticamente"
          >
            <LayoutGrid className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={onClearAllNodes}
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 flex-shrink-0"
            title="Limpar todos os nós"
          >
            <Eraser className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={onPreviewFlow}
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 flex-shrink-0 hover:bg-accent"
            title="Visualizar fluxo"
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={onSaveFlow}
            size="sm"
            className="h-7 w-7 p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
            title="Salvar fluxo"
          >
            <Save className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Segunda Linha - Menu de Nós */}
      <div className="flex items-center justify-center gap-1">
        {nodeTypes.map((node) => {
          const IconComponent = node.icon;
          return (
            <Button
              key={node.type}
              onClick={() => handleAddNode(node.type)}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0 hover:bg-accent"
              title={node.label}
            >
              <IconComponent className={`h-3 w-3 ${node.color}`} />
            </Button>
          );
        })}
      </div>
    </div>
  );
};
