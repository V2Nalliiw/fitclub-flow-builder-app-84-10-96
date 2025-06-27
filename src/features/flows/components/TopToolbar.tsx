
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Plus,
  Trash2,
  RotateCcw,
  GitBranch
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { FlowNode } from '@/types/flow';
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
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onAddNode: (type: FlowNode['type']) => void;
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
  isFullscreen,
  onAddNode,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-40 flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
      {/* Nome do Fluxo */}
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <Input
          value={flowName}
          onChange={(e) => onFlowNameChange(e.target.value)}
          className="w-48 h-8"
          placeholder="Nome do fluxo..."
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Adicionar Nós */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nó
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onAddNode('formStart')}>
            <Plus className="h-4 w-4 mr-2" />
            Início de Formulário
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('formEnd')}>
            <Plus className="h-4 w-4 mr-2" />
            Fim de Formulário
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('question')}>
            <Plus className="h-4 w-4 mr-2" />
            Pergunta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('delay')}>
            <Plus className="h-4 w-4 mr-2" />
            Aguardar Tempo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('end')}>
            <Plus className="h-4 w-4 mr-2" />
            Fim do Fluxo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nó Selecionado */}
      {selectedNode && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedNode.data?.label || 'Nó Selecionado'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAutoArrangeNodes}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Organizar
        </Button>
        
        <Button variant="outline" size="sm" onClick={onPreviewFlow}>
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
        
        <Button size="sm" onClick={onSaveFlow} className="bg-[#5D8701] hover:bg-[#4a6e01]">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
