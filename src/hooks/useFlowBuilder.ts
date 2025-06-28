
import { useState, useCallback, useEffect } from 'react';
import { useFlows } from './useFlows';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveFlowFromBuilder, updateFlowFromBuilder, flows } = useFlows();
  
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar fluxo para edição se especificado na URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && flows.length > 0) {
      const flowToEdit = flows.find(f => f.id === editId);
      if (flowToEdit) {
        setEditingFlowId(editId);
        setFlowName(flowToEdit.name);
        setFlowDescription(flowToEdit.description || '');
        setNodes(flowToEdit.nodes || initialNodes);
        setEdges(flowToEdit.edges || []);
      }
    }
  }, [searchParams, flows, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Conectando nós:', params);
      setEdges((eds) => addEdge(params, eds));
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
      
      toast.success(`${getNodeLabel(type)} adicionado ao fluxo`);
    }, 300);
  };

  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    // Não permitir deletar o nó inicial
    if (nodeId === '1' || nodeToDelete.type === 'start') {
      toast.error('Não é possível deletar o nó inicial');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      setIsLoading(false);
      
      toast.success('Nó removido do fluxo');
    }, 200);
  }, [nodes, selectedNode, setNodes, setEdges]);

  const clearAllNodes = () => {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar todo o fluxo?\n\nTodos os nós (exceto o inicial) e conexões serão removidos. Esta ação não pode ser desfeita."
    );
    
    if (!confirmClear) return;

    setIsLoading(true);
    
    setTimeout(() => {
      setNodes(initialNodes);
      setEdges([]);
      setSelectedNode(null);
      setIsLoading(false);
      
      toast.success('Fluxo limpo com sucesso');
    }, 300);
  };

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
      
      toast.success('Nós organizados automaticamente');
    }, 500);
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

    setIsLoading(true);
    
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, ...nodeData } }
            : node
        )
      );
      setIsLoading(false);
      
      toast.success('Configuração do nó salva');
    }, 200);
  };

  const openPreview = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreview = () => {
    setIsPreviewModalOpen(false);
  };

  const saveFlow = useCallback(async () => {
    console.log('=== INICIANDO SALVAMENTO DO FLUXO ===');
    
    if (!flowName.trim()) {
      toast.error('Por favor, insira um nome para o fluxo');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Adicione pelo menos um nó ao fluxo');
      return;
    }

    setIsSaving(true);
    
    try {
      const flowData = {
        name: flowName.trim(),
        description: flowDescription.trim() || undefined,
        nodes,
        edges,
      };

      console.log('Dados do fluxo para salvar:', {
        name: flowData.name,
        description: flowData.description,
        nodes: flowData.nodes.length,
        edges: flowData.edges.length,
        editingFlowId
      });

      if (editingFlowId) {
        console.log('Atualizando fluxo existente:', editingFlowId);
        await updateFlowFromBuilder(editingFlowId, flowData);
        toast.success('Fluxo atualizado com sucesso!');
      } else {
        console.log('Criando novo fluxo');
        await saveFlowFromBuilder(flowData);
        toast.success('Fluxo salvo com sucesso!');
      }

      // Redirecionar para a página "Meus Fluxos" após sucesso
      setTimeout(() => {
        navigate('/my-flows');
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      toast.error('Erro ao salvar fluxo. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [flowName, flowDescription, nodes, edges, editingFlowId, saveFlowFromBuilder, updateFlowFromBuilder, navigate]);

  const resetFlow = useCallback(() => {
    setFlowName('');
    setFlowDescription('');
    setNodes(initialNodes);
    setEdges([]);
    setEditingFlowId(null);
  }, [setNodes, setEdges]);

  const canSave = flowName.trim().length > 0 && nodes.length > 0;

  return {
    flowName,
    setFlowName,
    flowDescription,
    setFlowDescription,
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    isConfigModalOpen,
    setIsConfigModalOpen,
    isPreviewModalOpen,
    isLoading,
    addNode,
    deleteNode,
    clearAllNodes,
    autoArrangeNodes,
    onNodeDoubleClick,
    onNodeClick,
    handleNodeConfigSave,
    openPreview,
    closePreview,
    saveFlow,
    resetFlow,
    isSaving,
    canSave,
    editingFlowId,
    isEditing: !!editingFlowId,
  };
};
