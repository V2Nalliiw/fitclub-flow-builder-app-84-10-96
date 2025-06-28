
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
    { type: 'end' as FlowNode['type'], label: 'Fim do Fluxo', icon: Square, color: 'bg-red-500 hover:bg-red-600' },
    { type: 'formStart' as FlowNode['type'], label: 'Início de Formulário', icon: FileText, color: 'bg-blue-500 hover:bg-blue-600' },
    { type: 'formEnd' as FlowNode['type'], label: 'Fim de Formulário', icon: CheckSquare, color: 'bg-purple-500 hover:bg-purple-600' },
    { type: 'formSelect' as FlowNode['type'], label: 'Formulário Selecionado', icon: FormInput, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { type: 'delay' as FlowNode['type'], label: 'Aguardar Tempo', icon: Clock, color: 'bg-orange-500 hover:bg-orange-600' },
    { type: 'question' as FlowNode['type'], label: 'Pergunta', icon: HelpCircle, color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    console.log('Adicionando nó do tipo:', type);
    onAddNode(type);
    if (isMobile) {
      setShowNodeMenu(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Nome do Fluxo */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Input
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            placeholder="Nome do fluxo..."
            className="max-w-xs"
          />
          
          {selectedNode && (
            <Badge variant="secondary" className="truncate">
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
          >
            <Play className="h-4 w-4 mr-1" />
            {!isMobile && 'Visualizar'}
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
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {!isMobile && 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {!isMobile && 'Salvar'}
              </>
            )}
          </Button>

          {/* Tela Cheia */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Barra de Nós */}
      <div className="mt-3 pt-3 border-t">
        {/* Desktop/Tablet - Todos os botões expostos */}
        {!isMobile ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">Adicionar Nós:</span>
            
            {nodeTypes.map((nodeType) => {
              const IconComponent = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode(nodeType.type)}
                  className={`${nodeType.color} text-white border-none`}
                  title={nodeType.label}
                >
                  <IconComponent className="h-4 w-4 mr-1" />
                  <span className="text-xs">{nodeType.label}</span>
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
            >
              <AlignJustify className="h-4 w-4 mr-1" />
              Organizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllNodes}
              title="Limpar todos os nós"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Eraser className="h-4 w-4 mr-1" />
              Limpar Tudo
            </Button>

            {selectedNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteNode(selectedNode.id)}
                title="Deletar nó selecionado"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Deletar Selecionado
              </Button>
            )}
          </div>
        ) : (
          /* Mobile - Menu recolhível com botão + centralizado */
          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className="mb-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              {showNodeMenu ? 'Fechar Menu' : 'Adicionar Nós'}
            </Button>

            {showNodeMenu && (
              <div className="w-full">
                {/* Primeira linha - Nós */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {nodeTypes.map((nodeType) => {
                    const IconComponent = nodeType.icon;
                    return (
                      <Button
                        key={nodeType.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNode(nodeType.type)}
                        className={`${nodeType.color} text-white border-none text-xs p-2`}
                        title={nodeType.label}
                      >
                        <IconComponent className="h-3 w-3 mr-1" />
                        {nodeType.label.split(' ')[0]}
                      </Button>
                    );
                  })}
                </div>

                {/* Segunda linha - Ferramentas */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAutoArrangeNodes}
                    className="text-xs"
                  >
                    <AlignJustify className="h-3 w-3 mr-1" />
                    Organizar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllNodes}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    <Eraser className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>

                  {selectedNode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteNode(selectedNode.id)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Deletar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
