
import React from 'react';
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
  Loader2
} from 'lucide-react';
import { FlowNode } from '@/types/flow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const handleAddNode = (type: FlowNode['type']) => {
    console.log('Adicionando nó do tipo:', type);
    onAddNode(type);
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

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Adicionar Nós */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddNode('end')}>
                Fim do Fluxo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('formStart')}>
                Início de Formulário
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('formEnd')}>
                Fim de Formulário
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('formSelect')}>
                Formulário Selecionado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('delay')}>
                Aguardar Tempo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('question')}>
                Pergunta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Ferramentas */}
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoArrangeNodes}
            title="Organizar nós automaticamente"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllNodes}
            title="Limpar todos os nós"
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {selectedNode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              title="Deletar nó selecionado"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Ações principais */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewFlow}
            title="Visualizar fluxo"
          >
            <Play className="h-4 w-4 mr-1" />
            Visualizar
          </Button>

          <Button
            onClick={onSaveFlow}
            size="sm"
            disabled={!canSave || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
            title="Salvar fluxo"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </>
            )}
          </Button>

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
    </div>
  );
};
