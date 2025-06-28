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
      <div className="absolute top-[calc(2%+3rem)] left-4 right-4 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Nome do Fluxo e Controles de Nós */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="max-w-xs dark:bg-transparent dark:border-gray-800 dark:text-gray-100"
            />
            
            {/* Botões de Nós - Desktop e Mobile (mesmo layout) */}
            <div className="flex items-center gap-2">
              {nodeTypes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNode(nodeType.type)}
                    className={`dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 border-gray-200 hover:bg-gray-50 p-1.5 h-8 w-8`}
                    title={nodeType.label}
                  >
                    <IconComponent className={`h-3.5 w-3.5 ${nodeType.color}`} />
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
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 p-1.5 h-8 w-8"
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllNodes}
                title="Limpar todos os nós"
                className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-1.5 h-8 w-8"
              >
                <Eraser className="h-3.5 w-3.5" />
              </Button>

              {selectedNode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  title="Deletar nó selecionado"
                  className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 p-1.5 h-8 w-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            
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
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 h-8"
            >
              <Play className="h-3.5 w-3.5" />
            </Button>

            {/* Salvar */}
            <Button
              onClick={onSaveFlow}
              size="sm"
              disabled={!canSave || isSaving}
              className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] h-8"
              title="Salvar fluxo"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Tela Cheia */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 h-8"
            >
              {isFullscreen ? (
                <Minimize className="h-3.5 w-3.5" />
              ) : (
                <Maximize className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
