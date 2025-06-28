
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Play, 
  Maximize, 
  Minimize, 
  Trash2, 
  RotateCcw, 
  AlignJustify,
  Plus,
  Loader2,
  Square,
  FileText,
  CheckSquare,
  FormInput,
  Clock,
  HelpCircle,
  Eraser
} from 'lucide-react';
import { FlowNode } from '@/types/flow';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopToolbarProps {
  flowName: string;
  selectedNode: any;
  onFlowNameChange: (name: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClearAllNodes: () => void;
  onAutoArrangeNodes: () => void;
  onSaveFlow: () => void;
  onPreviewFlow: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onAddNode: (type: FlowNode['type']) => void;
  isSaving?: boolean;
  canSave?: boolean;
}

export const TopToolbar = ({
  flowName,
  selectedNode,
  onFlowNameChange,
  onDeleteNode,
  onClearAllNodes,
  onAutoArrangeNodes,
  onSaveFlow,
  onPreviewFlow,
  onToggleFullscreen,
  isFullscreen,
  onAddNode,
  isSaving = false,
  canSave = true
}: TopToolbarProps) => {
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const isMobile = useIsMobile();

  const nodeTypes = [
    { type: 'end' as FlowNode['type'], label: 'Fim', icon: Square, color: 'bg-red-500 hover:bg-red-600 text-white' },
    { type: 'formStart' as FlowNode['type'], label: 'Form Start', icon: FileText, color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { type: 'formEnd' as FlowNode['type'], label: 'Form End', icon: CheckSquare, color: 'bg-purple-500 hover:bg-purple-600 text-white' },
    { type: 'formSelect' as FlowNode['type'], label: 'Form Select', icon: FormInput, color: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    { type: 'delay' as FlowNode['type'], label: 'Delay', icon: Clock, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { type: 'question' as FlowNode['type'], label: 'Question', icon: HelpCircle, color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    console.log('Adicionando nó do tipo:', type);
    onAddNode(type);
    if (isMobile) {
      setShowNodeMenu(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 left-4 right-4 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Nome do Fluxo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="max-w-xs dark:bg-gray-900 dark:border-gray-700"
            />
            
            {selectedNode && (
              <Badge variant="secondary" className="truncate dark:bg-gray-800 dark:text-gray-200">
                {selectedNode.data?.label || 'Nó selecionado'}
              </Badge>
            )}
          </div>

          {/* Controles Principais */}
          <div className="flex items-center gap-2">
            {/* Visualizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviewFlow}
              title="Visualizar fluxo"
              className="dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Play className="h-4 w-4" />
            </Button>

            {/* Salvar */}
            <Button
              onClick={onSaveFlow}
              size="sm"
              disabled={!canSave || isSaving}
              className="bg-[#5D8701] hover:bg-[#4a6e01] text-white"
              title="Salvar fluxo"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            {/* Tela Cheia */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              className="dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Barra de Nós - Desktop/Tablet */}
        {!isMobile && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground mr-2">Nós:</span>
              
              {nodeTypes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNode(nodeType.type)}
                    className={`${nodeType.color} border-none p-2`}
                    title={nodeType.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}

              <Separator orientation="vertical" className="h-6 mx-2" />

              {/* Ferramentas */}
              <Button
                variant="outline"
                size="sm"
                onClick={onAutoArrangeNodes}
                title="Organizar nós automaticamente"
                className="dark:border-gray-700 dark:hover:bg-gray-800 p-2"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllNodes}
                title="Limpar todos os nós"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-2"
              >
                <Eraser className="h-4 w-4" />
              </Button>

              {selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  title="Deletar nó selecionado"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Mobile - Botão flutuante posicionado */}
      {isMobile && (
        <>
          <Button
            onClick={() => setShowNodeMenu(!showNodeMenu)}
            className="fixed top-[calc(5%+1rem)] right-[5%] z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white rounded-full w-12 h-12 p-0 shadow-lg"
            title="Menu de nós"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {showNodeMenu && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNodeMenu(false)}>
              <div className="absolute top-[calc(5%+4rem)] right-[5%] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 w-64">
                {/* Primeira linha - Nós */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {nodeTypes.map((nodeType) => {
                    const IconComponent = nodeType.icon;
                    return (
                      <Button
                        key={nodeType.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNode(nodeType.type)}
                        className={`${nodeType.color} border-none p-3 flex flex-col items-center gap-1`}
                        title={nodeType.label}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3" />

                {/* Segunda linha - Ferramentas */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="dark:border-gray-700 dark:hover:bg-gray-800 p-3 flex flex-col items-center gap-1"
                    title="Organizar"
                  >
                    <AlignJustify className="h-4 w-4" />
                    <span className="text-xs">Organizar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-3 flex flex-col items-center gap-1"
                    title="Limpar tudo"
                  >
                    <Eraser className="h-4 w-4" />
                    <span className="text-xs">Limpar</span>
                  </Button>

                  {selectedNode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDeleteNode(selectedNode.id);
                        setShowNodeMenu(false);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-3 flex flex-col items-center gap-1"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs">Deletar</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Menu Tablet - Botão centralizado */}
      {!isMobile && typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1024 && (
        <>
          <Button
            onClick={() => setShowNodeMenu(!showNodeMenu)}
            className="fixed top-[5%] left-1/2 transform -translate-x-1/2 z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white rounded-full w-12 h-12 p-0 shadow-lg"
            title="Menu de nós"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {showNodeMenu && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNodeMenu(false)}>
              <div className="absolute top-[calc(5%+4rem)] left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 w-80">
                {/* Primeira linha - Nós */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {nodeTypes.map((nodeType) => {
                    const IconComponent = nodeType.icon;
                    return (
                      <Button
                        key={nodeType.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNode(nodeType.type)}
                        className={`${nodeType.color} border-none p-3 flex flex-col items-center gap-1`}
                        title={nodeType.label}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3" />

                {/* Segunda linha - Ferramentas */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="dark:border-gray-700 dark:hover:bg-gray-800 p-3 flex flex-col items-center gap-1"
                    title="Organizar"
                  >
                    <AlignJustify className="h-4 w-4" />
                    <span className="text-xs">Organizar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-3 flex flex-col items-center gap-1"
                    title="Limpar tudo"
                  >
                    <Eraser className="h-4 w-4" />
                    <span className="text-xs">Limpar</span>
                  </Button>

                  {selectedNode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDeleteNode(selectedNode.id);
                        setShowNodeMenu(false);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-3 flex flex-col items-center gap-1"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs">Deletar</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
