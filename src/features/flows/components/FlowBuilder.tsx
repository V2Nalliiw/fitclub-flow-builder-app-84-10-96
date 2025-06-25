
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Settings } from 'lucide-react';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { FormStartNode } from './nodes/FormStartNode';
import { FormEndNode } from './nodes/FormEndNode';
import { DelayNode } from './nodes/DelayNode';
import { QuestionNode } from './nodes/QuestionNode';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowNode } from '@/types/flow';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  formStart: FormStartNode,
  formEnd: FormEndNode,
  delay: DelayNode,
  question: QuestionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 25 },
    data: { label: 'Início do Fluxo' },
  },
];

const initialEdges: Edge[] = [];

export const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('Novo Fluxo');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: FlowNode['type']) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 200 
      },
      data: { 
        label: getNodeLabel(type),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getNodeLabel = (type: FlowNode['type']) => {
    switch (type) {
      case 'end': return 'Fim do Fluxo';
      case 'formStart': return 'Início de Formulário';
      case 'formEnd': return 'Fim de Formulário';
      case 'delay': return 'Aguardar Tempo';
      case 'question': return 'Pergunta';
      default: return 'Novo Nó';
    }
  };

  const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsConfigModalOpen(true);
  };

  const handleNodeConfigSave = (nodeData: Partial<Node['data']>) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...nodeData } }
          : node
      )
    );
  };

  const saveFlow = () => {
    // Convert React Flow nodes to FlowNodes for saving
    const flowNodes: FlowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as FlowNode['type'],
      position: node.position,
      data: {
        label: String(node.data.label || ''),
        ...node.data
      }
    }));

    const flowData = {
      nome: flowName,
      nodes: flowNodes,
      edges: edges,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Salvando fluxo:', flowData);
    // Aqui integraria com Supabase para salvar
  };

  return (
    <div className="h-full flex gap-4">
      {/* Sidebar com ferramentas */}
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
              onChange={(e) => setFlowName(e.target.value)}
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
                onClick={() => addNode('formStart')}
                className="justify-start text-xs h-9"
              >
                <Plus className="h-3 w-3 mr-2" />
                Início de Formulário
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('formEnd')}
                className="justify-start text-xs h-9"
              >
                <Plus className="h-3 w-3 mr-2" />
                Fim de Formulário
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('question')}
                className="justify-start text-xs h-9"
              >
                <Plus className="h-3 w-3 mr-2" />
                Pergunta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('delay')}
                className="justify-start text-xs h-9"
              >
                <Plus className="h-3 w-3 mr-2" />
                Aguardar Tempo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('end')}
                className="justify-start text-xs h-9"
              >
                <Plus className="h-3 w-3 mr-2" />
                Fim do Fluxo
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              💡 Dica: Clique duas vezes em um nó para configurá-lo
            </p>
            <Button onClick={saveFlow} className="w-full bg-[#5D8701] hover:bg-[#4a6e01]">
              <Save className="h-4 w-4 mr-2" />
              Salvar Fluxo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área do React Flow */}
      <div className="flex-1 h-[600px] border rounded-lg bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor="#5D8701"
            nodeColor="#5D8701"
            nodeBorderRadius={8}
          />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Modal de Configuração */}
      <NodeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedNode(null);
        }}
        node={selectedNode}
        onSave={handleNodeConfigSave}
      />
    </div>
  );
};
