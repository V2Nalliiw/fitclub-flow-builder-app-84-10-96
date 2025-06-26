
import { useCallback, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import { FlowNode } from '@/types/flow';
import { toast } from '@/hooks/use-toast';

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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
    toast({
      title: "Nó adicionado",
      description: `${getNodeLabel(type)} foi adicionado ao fluxo.`,
    });
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    toast({
      title: "Nó removido",
      description: "O nó foi removido do fluxo.",
      variant: "destructive",
    });
  };

  const duplicateNode = (nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: Node = {
      ...nodeToDuplicate,
      id: `${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data?.label || ''} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: "Nó duplicado",
      description: "O nó foi duplicado com sucesso.",
    });
  };

  const autoArrangeNodes = () => {
    const arrangedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * 250 + 100,
        y: Math.floor(index / 4) * 150 + 50,
      },
    }));
    setNodes(arrangedNodes);
    toast({
      title: "Nós organizados",
      description: "Os nós foram organizados automaticamente.",
    });
  };

  const clearAllNodes = () => {
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      setNodes([startNode]);
    } else {
      setNodes(initialNodes);
    }
    setEdges([]);
    setSelectedNode(null);
    toast({
      title: "Fluxo limpo",
      description: "Todos os nós foram removidos, exceto o nó inicial.",
      variant: "destructive",
    });
  };

  const getNodeLabel = (type: FlowNode['type']) => {
    switch (type) {
      case 'end': return 'Fim do Fluxo';
      case 'formStart': return 'Início de Formulário';
      case 'formEnd': return 'Fim de Formulário';
      case 'formSelect': return 'Formulário Salvo';
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

    // Atualizar handles para escolha única (múltiplas saídas)
    if (selectedNode.type === 'question' && nodeData.tipoResposta === 'escolha-unica' && nodeData.opcoes) {
      updateQuestionNodeHandles(selectedNode.id, nodeData.opcoes as string[]);
    }

    toast({
      title: "Configuração salva",
      description: "As configurações do nó foram atualizadas.",
    });
  };

  const updateQuestionNodeHandles = (nodeId: string, opcoes: string[]) => {
    // Remove conexões existentes do nó
    setEdges((eds) => eds.filter((e) => e.source !== nodeId));
    
    // Atualiza o nó com as novas opções
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, opcoes } }
          : node
      )
    );
  };

  const openPreview = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreview = () => {
    setIsPreviewModalOpen(false);
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
    
    toast({
      title: "Fluxo salvo",
      description: `O fluxo "${flowName}" foi salvo com sucesso.`,
    });
  };

  return {
    nodes,
    edges,
    flowName,
    selectedNode,
    isConfigModalOpen,
    isPreviewModalOpen,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setFlowName,
    setSelectedNode,
    setIsConfigModalOpen,
    addNode,
    deleteNode,
    duplicateNode,
    autoArrangeNodes,
    clearAllNodes,
    onNodeDoubleClick,
    onNodeClick,
    handleNodeConfigSave,
    saveFlow,
    openPreview,
    closePreview,
  };
};
