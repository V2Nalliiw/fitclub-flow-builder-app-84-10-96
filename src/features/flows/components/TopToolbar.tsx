
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
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1024;

  const nodeTypes = [
    { type: 'end' as FlowNode['type'], icon: Square, color: 'text-red-500' },
    { type: 'formStart' as FlowNode['type'], icon: FileText, color: 'text-blue-500' },
    { type: 'formEnd' as FlowNode['type'], icon: CheckSquare, color: 'text-purple-500' },
    { type: 'formSelect' as FlowNode['type'], icon: FormInput, color: 'text-indigo-500' },
    { type: 'delay' as FlowNode['type'], icon: Clock, color: 'text-orange-500' },
    { type: 'question' as FlowNode['type'], icon: HelpCircle, color: 'text-yellow-500' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    console.log('Adicionando nó do tipo:', type);
    onAddNode(type);
    if (isMobile || isTablet) {
      setShowNodeMenu(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 left-4 right-4 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Nome do Fluxo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="max-w-xs dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-gray-100"
            />
            
            {selectedNode && (
              <Badge variant="secondary" className="truncate dark:bg-[#1A1A1A] dark:text-gray-200">
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
              className="dark:border-gray-600 dark:hover:bg-[#1A1A1A] dark:text-gray-300"
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
              className="dark:border-gray-600 dark:hover:bg-[#1A1A1A] dark:text-gray-300"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Desktop - Barra única horizontal */}
        {!isMobile && !isTablet && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-3">
              {/* Nós */}
              {nodeTypes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNode(nodeType.type)}
                    className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3"
                    title={`Adicionar ${nodeType.type}`}
                  >
                    <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                  </Button>
                );
              })}

              <Separator orientation="vertical" className="h-8 mx-2 dark:bg-gray-600" />

              {/* Salvar - Destacado */}
              <Button
                onClick={onSaveFlow}
                size="sm"
                disabled={!canSave || isSaving}
                className="bg-[#5D8701] hover:bg-[#4a6e01] text-white p-3"
                title="Salvar fluxo"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
              </Button>

              <Separator orientation="vertical" className="h-8 mx-2 dark:bg-gray-600" />

              {/* Ferramentas */}
              <Button
                variant="outline"
                size="sm"
                onClick={onAutoArrangeNodes}
                title="Organizar nós"
                className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3"
              >
                <AlignJustify className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllNodes}
                title="Limpar todos os nós"
                className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3"
              >
                <Eraser className="h-4 w-4 text-red-500" />
              </Button>

              {selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  title="Deletar nó selecionado"
                  className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Mobile/Tablet - Botão flutuante */}
      {(isMobile || isTablet) && (
        <>
          <Button
            onClick={() => setShowNodeMenu(!showNodeMenu)}
            className={`fixed ${isTablet ? 'top-[20%] left-1/2 transform -translate-x-1/2' : 'top-[20%] right-[5%]'} z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white rounded-full w-12 h-12 p-0 shadow-lg`}
            title="Menu de nós"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {showNodeMenu && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNodeMenu(false)}>
              <div className={`absolute ${isTablet ? 'top-[calc(20%+4rem)] left-1/2 transform -translate-x-1/2' : 'top-[calc(20%+4rem)] right-[5%]'} bg-white dark:bg-[#0E0E0E] border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 ${isTablet ? 'w-80' : 'w-64'}`}>
                {/* Primeira linha - Nós */}
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {nodeTypes.map((nodeType) => {
                    const IconComponent = nodeType.icon;
                    return (
                      <Button
                        key={nodeType.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNode(nodeType.type)}
                        className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                        title={`Adicionar ${nodeType.type}`}
                      >
                        <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3 dark:bg-gray-600" />

                {/* Segunda linha - Controles */}
                <div className="grid grid-cols-6 gap-2">
                  <Button
                    onClick={onSaveFlow}
                    size="sm"
                    disabled={!canSave || isSaving}
                    className="bg-[#5D8701] hover:bg-[#4a6e01] text-white p-3 w-12 h-12"
                    title="Salvar"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviewFlow}
                    className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                    title="Visualizar"
                  >
                    <Play className="h-4 w-4 text-blue-500" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                    title="Tela cheia"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Maximize className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                    title="Organizar"
                  >
                    <AlignJustify className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                    title="Limpar tudo"
                  >
                    <Eraser className="h-4 w-4 text-red-500" />
                  </Button>

                  {selectedNode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDeleteNode(selectedNode.id);
                        setShowNodeMenu(false);
                      }}
                      className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-[#252525] p-3 w-12 h-12"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
