
import { useCallback, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import { FlowNode } from '@/types/flow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 25 },
    data: { label: 'Início do Fluxo' },
  },
];

const initialEdges: Edge[] = [];

export const useFlowBuilder = () => {
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

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  const clearAllNodes = () => {
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      setNodes([startNode]);
    } else {
      setNodes(initialNodes);
    }
    setEdges([]);
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

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (event.detail === 1) {
      setSelectedNode(node);
    }
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

    if (selectedNode.type === 'question' && nodeData.tipoResposta === 'multipla-escolha' && nodeData.opcoes) {
      updateQuestionNodeHandles(selectedNode.id, nodeData.opcoes as string[]);
    }
  };

  const updateQuestionNodeHandles = (nodeId: string, opcoes: string[]) => {
    setEdges((eds) => eds.filter((e) => e.source !== nodeId));
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, opcoes } }
          : node
      )
    );
  };

  const saveFlow = () => {
    const flowNodes: FlowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as FlowNode['type'],
      position: node.position,
      data: {
        label: String(node.data?.label || ''),
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
  };

  return {
    nodes,
    edges,
    flowName,
    selectedNode,
    isConfigModalOpen,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setFlowName,
    setSelectedNode,
    setIsConfigModalOpen,
    addNode,
    deleteNode,
    clearAllNodes,
    onNodeDoubleClick,
    onNodeClick,
    handleNodeConfigSave,
    saveFlow,
  };
};
