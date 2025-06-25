
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
import { Plus, Save } from 'lucide-react';
import { FlowStartNode } from './nodes/FlowStartNode';
import { FlowEndNode } from './nodes/FlowEndNode';
import { FormStartNode } from './nodes/FormStartNode';
import { FormEndNode } from './nodes/FormEndNode';
import { TimeNode } from './nodes/TimeNode';
import { QuestionNode } from './nodes/QuestionNode';

const nodeTypes = {
  flowStart: FlowStartNode,
  flowEnd: FlowEndNode,
  formStart: FormStartNode,
  formEnd: FormEndNode,
  time: TimeNode,
  question: QuestionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'flowStart',
    position: { x: 250, y: 25 },
    data: { label: 'Início do Fluxo' },
  },
];

const initialEdges: Edge[] = [];

export const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('Novo Fluxo');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 + 100 },
      data: { 
        label: getNodeLabel(type),
        content: '',
        options: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case 'flowEnd': return 'Fim do Fluxo';
      case 'formStart': return 'Início de Formulário';
      case 'formEnd': return 'Fim de Formulário';
      case 'time': return 'Tempo';
      case 'question': return 'Pergunta';
      default: return 'Novo Nó';
    }
  };

  const saveFlow = () => {
    console.log('Salvando fluxo:', { name: flowName, nodes, edges });
    // Aqui integraria com Supabase para salvar
  };

  return (
    <div className="h-full flex gap-4">
      {/* Sidebar com ferramentas */}
      <Card className="w-80 h-fit">
        <CardHeader>
          <CardTitle>Construtor de Fluxos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="flowName">Nome do Fluxo</Label>
            <Input
              id="flowName"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Adicionar Nós</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('formStart')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Formulário
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('question')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Pergunta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('time')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Tempo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('flowEnd')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Fim
              </Button>
            </div>
          </div>

          <Button onClick={saveFlow} className="w-full bg-[#5D8701] hover:bg-[#4a6e01]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Fluxo
          </Button>
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
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};
