
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Settings } from 'lucide-react';
import { FlowBuilderToolbar } from './FlowBuilderToolbar';
import { FlowNode } from '@/types/flow';
import { Node } from '@xyflow/react';

interface FlowBuilderSidebarProps {
  flowName: string;
  selectedNode: Node | null;
  onFlowNameChange: (name: string) => void;
  onAddNode: (type: FlowNode['type']) => void;
  onDeleteNode: (nodeId: string) => void;
  onClearAllNodes: () => void;
  onSaveFlow: () => void;
}

export const FlowBuilderSidebar: React.FC<FlowBuilderSidebarProps> = ({
  flowName,
  selectedNode,
  onFlowNameChange,
  onAddNode,
  onDeleteNode,
  onClearAllNodes,
  onSaveFlow,
}) => {
  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Construtor de Fluxos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="flowName">Nome do Fluxo</Label>
          <Input
            id="flowName"
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            className="mt-1"
            placeholder="Digite o nome do fluxo..."
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Adicionar Nós</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('formStart')}
              className="justify-start text-xs h-9"
            >
              <Plus className="h-3 w-3 mr-2" />
              Início de Formulário
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('formEnd')}
              className="justify-start text-xs h-9"
            >
              <Plus className="h-3 w-3 mr-2" />
              Fim de Formulário
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('question')}
              className="justify-start text-xs h-9"
            >
              <Plus className="h-3 w-3 mr-2" />
              Pergunta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('delay')}
              className="justify-start text-xs h-9"
            >
              <Plus className="h-3 w-3 mr-2" />
              Aguardar Tempo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('end')}
              className="justify-start text-xs h-9"
            >
              <Plus className="h-3 w-3 mr-2" />
              Fim do Fluxo
            </Button>
          </div>
        </div>

        <FlowBuilderToolbar
          selectedNode={selectedNode}
          onDeleteNode={onDeleteNode}
          onClearAllNodes={onClearAllNodes}
        />

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            💡 Dica: Clique duas vezes em um nó para configurá-lo
          </p>
          <Button onClick={onSaveFlow} className="w-full bg-[#5D8701] hover:bg-[#4a6e01]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Fluxo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
