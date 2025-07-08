
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
import { useBreakpoints } from '@/hooks/use-breakpoints';

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
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

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
  };

  // Definir posição baseada no dispositivo
  const getTopPosition = () => {
    if (isMobile) {
      return 'top-[calc(5%+3rem)]';
    }
    if (isTablet) {
      return 'top-[calc(5%+3rem)]';
    }
    // Desktop: bem próximo do cabeçalho
    return 'top-[calc(4rem+0.5rem)]';
  };

  // Desktop: Menu minimalista fixo na parte inferior com todos os controles
  if (isDesktop) {
    return (
      <>
        {/* Header vazio para desktop - apenas badge do nó selecionado se houver */}
        {selectedNode && (
          <div className={`absolute ${getTopPosition()} left-4 z-40`}>
            <Badge variant="secondary" className="truncate dark:bg-[#0E0E0E]/50 dark:text-gray-200 dark:border-gray-800 text-xs py-0.5">
              {selectedNode.data?.label || 'Nó selecionado'}
            </Badge>
          </div>
        )}

        {/* Menu flutuante minimalista fixo na parte inferior central - Desktop */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Campo Nome do Fluxo */}
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="dark:bg-transparent dark:border-gray-700 dark:text-gray-100 text-sm w-48 h-8 rounded-full px-3"
            />

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Botões de Nós agrupados */}
            {nodeTypes.map((nodeType) => {
              const IconComponent = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode(nodeType.type)}
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 border-gray-200 hover:bg-gray-50 h-9 w-9 p-0 rounded-full"
                  title={nodeType.label}
                >
                  <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                </Button>
              );
            })}

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Botão Visualizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviewFlow}
              title="Visualizar fluxo"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 h-9 w-9 p-0 rounded-full"
            >
              <Play className="h-4 w-4" />
            </Button>

            {/* Botão Salvar */}
            <Button
              onClick={onSaveFlow}
              size="sm"
              disabled={!canSave || isSaving}
              className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] h-9 w-9 p-0 rounded-full"
              title="Salvar fluxo"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Ferramentas */}
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoArrangeNodes}
              title="Organizar nós automaticamente"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 h-9 w-9 p-0 rounded-full"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllNodes}
              title="Limpar todos os nós"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 h-9 w-9 p-0 rounded-full"
            >
              <Eraser className="h-4 w-4" />
            </Button>

            {selectedNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteNode(selectedNode.id)}
                title="Deletar nó selecionado"
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 h-9 w-9 p-0 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  // Tablet: Layout em uma linha SEM os botões de nós
  if (isTablet) {
    return (
      <>
        <div className={`absolute ${getTopPosition()} left-4 right-4 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2`}>
          <div className="flex items-center justify-between gap-2">
            {/* Campo Nome do Fluxo */}
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="dark:bg-transparent dark:border-gray-800 dark:text-gray-100 text-sm max-w-[140px] h-7"
            />
            
            {selectedNode && (
              <Badge variant="secondary" className="truncate dark:bg-[#0E0E0E]/50 dark:text-gray-200 dark:border-gray-800 text-xs py-0.5 max-w-[80px]">
                {selectedNode.data?.label || 'Nó'}
              </Badge>
            )}

            {/* Controles Principais */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviewFlow}
                title="Visualizar fluxo"
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 px-2 h-7"
              >
                <Play className="h-3 w-3" />
              </Button>

              <Button
                onClick={onSaveFlow}
                size="sm"
                disabled={!canSave || isSaving}
                className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] px-2 h-7"
                title="Salvar fluxo"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onAutoArrangeNodes}
                title="Organizar nós automaticamente"
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 p-0 h-6 w-6"
              >
                <AlignJustify className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllNodes}
                title="Limpar todos os nós"
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-0 h-6 w-6"
              >
                <Eraser className="h-3 w-3" />
              </Button>

              {selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  title="Deletar nó selecionado"
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-0 h-6 w-6"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Menu separado de nós na lateral direita - TABLET */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2">
          <div className="flex flex-col gap-1">
            {nodeTypes.map((nodeType) => {
              const IconComponent = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode(nodeType.type)}
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 border-gray-200 hover:bg-gray-50 p-0 h-8 w-8"
                  title={nodeType.label}
                >
                  <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Mobile: Layout original
  return (
    <>
      <div className={`absolute ${getTopPosition()} left-4 right-4 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2`}>
        {/* Primeira linha - Nome do fluxo e controles principais */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="dark:bg-transparent dark:border-gray-800 dark:text-gray-100 text-sm max-w-xs h-7"
            />
            
            {selectedNode && (
              <Badge variant="secondary" className="truncate dark:bg-[#0E0E0E]/50 dark:text-gray-200 dark:border-gray-800 text-xs py-0.5">
                {selectedNode.data?.label || 'Nó selecionado'}
              </Badge>
            )}
          </div>

          {/* Controles Principais */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviewFlow}
              title="Visualizar fluxo"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 px-2 h-7"
            >
              <Play className="h-3 w-3" />
            </Button>

            <Button
              onClick={onSaveFlow}
              size="sm"
              disabled={!canSave || isSaving}
              className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] px-2 h-7"
              title="Salvar fluxo"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllNodes}
              title="Limpar todos os nós"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 px-2 h-7"
            >
              <Eraser className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Segunda linha - Todos os botões de nós e ferramentas */}
        <div className="flex items-center justify-center gap-1">
          {/* Botões de Nós */}
          {nodeTypes.map((nodeType) => {
            const IconComponent = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                size="sm"
                onClick={() => handleAddNode(nodeType.type)}
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 border-gray-200 hover:bg-gray-50 p-0 h-6 w-6"
                title={nodeType.label}
              >
                <IconComponent className={`h-3 w-3 ${nodeType.color}`} />
              </Button>
            );
          })}

          {selectedNode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              title="Deletar nó selecionado"
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-[#0E0E0E]/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-0 h-6 w-6"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
