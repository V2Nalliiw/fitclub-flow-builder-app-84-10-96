
import { useState, useCallback, useEffect } from 'react';
import { useFlows } from './useFlows';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const useFlowBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveFlowFromBuilder, updateFlowFromBuilder, flows } = useFlows();
  
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);

  // Carregar fluxo para edição se especificado na URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && flows.length > 0) {
      const flowToEdit = flows.find(f => f.id === editId);
      if (flowToEdit) {
        setEditingFlowId(editId);
        setFlowName(flowToEdit.name);
        setFlowDescription(flowToEdit.description || '');
        setNodes(flowToEdit.nodes || []);
        setEdges(flowToEdit.edges || []);
      }
    }
  }, [searchParams, flows]);

  const saveFlow = useCallback(async () => {
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

      if (editingFlowId) {
        await updateFlowFromBuilder(editingFlowId, flowData);
        toast.success('Fluxo atualizado com sucesso!');
      } else {
        await saveFlowFromBuilder(flowData);
        toast.success('Fluxo salvo com sucesso!');
      }

      // Redirecionar para a página "Meus Fluxos"
      setTimeout(() => {
        navigate('/my-flows');
      }, 1000);

    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      toast.error('Erro ao salvar fluxo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [flowName, flowDescription, nodes, edges, editingFlowId, saveFlowFromBuilder, updateFlowFromBuilder, navigate]);

  const resetFlow = useCallback(() => {
    setFlowName('');
    setFlowDescription('');
    setNodes([]);
    setEdges([]);
    setEditingFlowId(null);
  }, []);

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
    saveFlow,
    resetFlow,
    isSaving,
    canSave,
    editingFlowId,
    isEditing: !!editingFlowId,
  };
};
