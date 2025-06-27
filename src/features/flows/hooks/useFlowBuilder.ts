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
  const [isLoading, setIsLoading] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      toast({
        title: "Conexão criada",
        description: "Os nós foram conectados com sucesso.",
      });
    },
    [setEdges]
  );

  const calculateSmartPosition = (existingNodes: Node[]) => {
    if (existingNodes.length <= 1) {
      return { x: 250, y: 150 };
    }

    const sortedNodes = existingNodes
      .filter(node => node.id !== '1')
      .sort((a, b) => parseInt(b.id) - parseInt(a.id));
    
    if (sortedNodes.length === 0) {
      const startNode = existingNodes.find(node => node.id === '1');
      return {
        x: startNode ? startNode.position.x : 250,
        y: startNode ? startNode.position.y + 150 : 150
      };
    }

    const lastNode = sortedNodes[0];
    
    return {
      x: lastNode.position.x + 50,
      y: lastNode.position.y + 120
    };
  };

  const addNode = (type: FlowNode['type']) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const position = calculateSmartPosition(nodes);
      
      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: { 
          label: getNodeLabel(type),
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setIsLoading(false);
      
      toast({
        title: "Nó adicionado",
        description: `${getNodeLabel(type)} foi adicionado ao fluxo.`,
      });
    }, 300);
  };

  const deleteNode = useCallback((nodeId: string) => {
    console.log('useFlowBuilder - deleteNode chamado para:', nodeId);
    
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) {
      console.error('Nó não encontrado:', nodeId);
      return;
    }

    // Não permitir deletar o nó inicial
    if (nodeId === '1' || nodeToDelete.type === 'start') {
      console.log('Tentativa de deletar nó inicial bloqueada');
      return;
    }

    console.log('Deletando nó:', {
      nodeId,
      nodeType: nodeToDelete.type,
      nodeLabel: nodeToDelete.data?.label
    });

    setIsLoading(true);
    
    setTimeout(() => {
      setNodes((nds) => {
        const filteredNodes = nds.filter((n) => n.id !== nodeId);
        console.log('Nós após remoção:', filteredNodes.length);
        return filteredNodes;
      });
      
      setEdges((eds) => {
        const filteredEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        console.log('Edges após remoção do nó:', filteredEdges.length);
        return filteredEdges;
      });
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      setIsLoading(false);
      
      toast({
        title: "Nó removido",
        description: `O nó "${nodeToDelete.data?.label || 'Sem nome'}" foi removido do fluxo.`,
        variant: "destructive",
      });
    }, 200);
  }, [nodes, selectedNode, setNodes, setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    console.log('useFlowBuilder - duplicateNode chamado para:', nodeId);
    
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) {
      console.error('Nó não encontrado para duplicar:', nodeId);
      return;
    }

    // Não permitir duplicar o nó inicial
    if (nodeId === '1' || nodeToDuplicate.type === 'start') {
      console.log('Tentativa de duplicar nó inicial bloqueada');
      return;
    }

    console.log('Duplicando nó:', {
      nodeId,
      nodeType: nodeToDuplicate.type,
      nodeLabel: nodeToDuplicate.data?.label
    });

    setIsLoading(true);
    
    setTimeout(() => {
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
      
      setNodes((nds) => {
        const newNodes = [...nds, newNode];
        console.log('Nós após duplicação:', newNodes.length);
        return newNodes;
      });
      
      setIsLoading(false);
      
      toast({
        title: "Nó duplicado",
        description: `O nó "${nodeToDuplicate.data?.label || 'Sem nome'}" foi duplicado com sucesso.`,
      });
    }, 300);
  }, [nodes, setNodes]);

  const autoArrangeNodes = () => {
    const confirmArrange = window.confirm(
      "Tem certeza que deseja reorganizar automaticamente todos os nós?\n\nAs posições atuais serão perdidas."
    );
    
    if (!confirmArrange) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const arrangedNodes = nodes.map((node, index) => ({
        ...node,
        position: {
          x: (index % 4) * 250 + 100,
          y: Math.floor(index / 4) * 150 + 50,
        },
      }));
      setNodes(arrangedNodes);
      setIsLoading(false);
      
      toast({
        title: "Nós organizados",
        description: "Os nós foram reorganizados automaticamente.",
      });
    }, 500);
  };

  const clearAllNodes = () => {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar todo o fluxo?\n\nTodos os nós (exceto o inicial) e conexões serão removidos. Esta ação não pode ser desfeita."
    );
    
    if (!confirmClear) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const startNode = nodes.find(n => n.type === 'start');
      if (startNode) {
        setNodes([startNode]);
      } else {
        setNodes(initialNodes);
      }
      setEdges([]);
      setSelectedNode(null);
      setIsLoading(false);
      
      toast({
        title: "Fluxo limpo",
        description: "Todos os nós foram removidos, exceto o nó inicial.",
        variant: "destructive",
      });
    }, 300);
  };

  const getNodeLabel = (type: FlowNode['type']) => {
    switch (type) {
      case 'end': return 'Fim do Fluxo';
      case 'formStart': return 'Início de Formulário';
      case 'formEnd': return 'Fim de Formulário';
      case 'formSelect': return 'Formulário Selecionado';
      case 'delay': return 'Aguardar Tempo';
      case 'question': return 'Pergunta';
      default: return 'Novo Nó';
    }
  };

  const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsConfigModalOpen(true);
    
    toast({
      title: "Configuração aberta",
      description: `Configurando o nó "${node.data?.label || 'Sem nome'}".`,
    });
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (event.detail === 1) {
      setSelectedNode(node);
    }
  };

  const handleNodeConfigSave = (nodeData: Partial<Node['data']>) => {
    if (!selectedNode) return;

    setIsLoading(true);
    
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, ...nodeData } }
            : node
        )
      );

      if (selectedNode.type === 'question' && nodeData.tipoResposta === 'escolha-unica' && nodeData.opcoes) {
        updateQuestionNodeHandles(selectedNode.id, nodeData.opcoes as string[]);
      }

      setIsLoading(false);
      
      toast({
        title: "Configuração salva",
        description: `As configurações do nó "${selectedNode.data?.label || 'Sem nome'}" foram atualizadas.`,
      });
    }, 200);
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

  const openPreview = () => {
    setIsPreviewModalOpen(true);
    toast({
      title: "Visualização aberta",
      description: "Visualizando o fluxo criado.",
    });
  };

  const closePreview = () => {
    setIsPreviewModalOpen(false);
  };

  const saveFlow = () => {
    setIsLoading(true);
    
    setTimeout(() => {
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
      setIsLoading(false);
      
      toast({
        title: "Fluxo salvo",
        description: `O fluxo "${flowName}" foi salvo com sucesso.`,
      });
    }, 800);
  };

  return {
    nodes,
    edges,
    flowName,
    selectedNode,
    isConfigModalOpen,
    isPreviewModalOpen,
    isLoading,
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
