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
    { type: 'end' as FlowNode['type'], label: 'Fim', icon: Square, color: 'text-red-500' },
    { type: 'formStart' as FlowNode['type'], label: 'Form Start', icon: FileText, color: 'text-blue-500' },
    { type: 'formEnd' as FlowNode['type'], label: 'Form End', icon: CheckSquare, color: 'text-purple-500' },
    { type: 'formSelect' as FlowNode['type'], label: 'Form Select', icon: FormInput, color: 'text-indigo-500' },
    { type: 'delay' as FlowNode['type'], label: 'Delay', icon: Clock, color: 'text-orange-500' },
    { type: 'question' as FlowNode['type'], label: 'Question', icon: HelpCircle, color: 'text-yellow-500' },
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
      <div className="absolute top-[20%] left-4 right-4 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Nome do Fluxo e Controles de Nós */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="max-w-xs dark:bg-transparent dark:border-gray-800 dark:text-gray-100"
            />
            
            {/* Botões de Nós - Desktop */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                {nodeTypes.map((nodeType) => {
                  const IconComponent = nodeType.icon;
                  return (
                    <Button
                      key={nodeType.type}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNode(nodeType.type)}
                      className={`dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 border-gray-200 hover:bg-gray-50 p-2`}
                      title={nodeType.label}
                    >
                      <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                    </Button>
                  );
                })}

                <Separator orientation="vertical" className="h-6 mx-2 dark:bg-gray-800" />

                {/* Ferramentas */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAutoArrangeNodes}
                  title="Organizar nós automaticamente"
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 p-2"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAllNodes}
                  title="Limpar todos os nós"
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-2"
                >
                  <Eraser className="h-4 w-4" />
                </Button>

                {selectedNode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteNode(selectedNode.id)}
                    title="Deletar nó selecionado"
                    className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            {selectedNode && (
              <Badge variant="secondary" className="truncate dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-800">
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
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50"
            >
              <Play className="h-4 w-4" />
            </Button>

            {/* Salvar */}
            <Button
              onClick={onSaveFlow}
              size="sm"
              disabled={!canSave || isSaving}
              className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01]"
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
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile - Botão flutuante posicionado */}
      {isMobile && (
        <>
          <Button
            onClick={() => setShowNodeMenu(!showNodeMenu)}
            className="fixed top-[calc(20%+1rem)] right-[5%] z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white rounded-full w-12 h-12 p-0 shadow-lg"
            title="Menu de nós"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {showNodeMenu && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNodeMenu(false)}>
              <div className="absolute top-[calc(20%+4rem)] right-[5%] bg-white dark:bg-[#0E0E0E] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 w-64">
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
                        className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 border-gray-200 hover:bg-gray-50 p-3 flex flex-col items-center gap-1"
                        title={nodeType.label}
                      >
                        <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                        <span className="text-xs dark:text-gray-300">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3 dark:bg-gray-800" />

                {/* Segunda linha - Ferramentas */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 p-3 flex flex-col items-center gap-1"
                    title="Organizar"
                  >
                    <AlignJustify className="h-4 w-4" />
                    <span className="text-xs">Organizar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-3 flex flex-col items-center gap-1"
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
                      className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-3 flex flex-col items-center gap-1"
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
            className="fixed top-[20%] left-1/2 transform -translate-x-1/2 z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white rounded-full w-12 h-12 p-0 shadow-lg"
            title="Menu de nós"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {showNodeMenu && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNodeMenu(false)}>
              <div className="absolute top-[calc(20%+4rem)] left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#0E0E0E] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 w-80">
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
                        className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 border-gray-200 hover:bg-gray-50 p-3 flex flex-col items-center gap-1"
                        title={nodeType.label}
                      >
                        <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                        <span className="text-xs dark:text-gray-300">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3 dark:bg-gray-800" />

                {/* Segunda linha - Ferramentas */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 p-3 flex flex-col items-center gap-1"
                    title="Organizar"
                  >
                    <AlignJustify className="h-4 w-4" />
                    <span className="text-xs">Organizar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-3 flex flex-col items-center gap-1"
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
                      className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-3 flex flex-col items-center gap-1"
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
