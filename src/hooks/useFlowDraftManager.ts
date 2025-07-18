import { useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface FlowDraft {
  flowName: string;
  flowDescription: string;
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

const DRAFT_KEY = 'fitclub_flow_draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 segundos

export const useFlowDraftManager = () => {
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Salvar draft no localStorage
  const saveDraft = useCallback((
    flowName: string,
    flowDescription: string,
    nodes: Node[],
    edges: Edge[]
  ) => {
    // Só salva draft se não estiver editando um fluxo existente (novo fluxo)
    const urlParams = new URLSearchParams(window.location.search);
    const isEditing = urlParams.get('edit');
    
    if (isEditing) return; // Não salva draft se estiver editando fluxo existente

    // Só salva se houver mudanças significativas (mais que o nó inicial)
    if (nodes.length <= 1 && edges.length === 0 && !flowName.trim()) {
      return;
    }

    const draft: FlowDraft = {
      flowName,
      flowDescription,
      nodes,
      edges,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      console.log('💾 Draft auto-salvo:', draft);
    } catch (error) {
      console.error('Erro ao salvar draft:', error);
    }
  }, []);

  // Carregar draft do localStorage
  const loadDraft = useCallback((): FlowDraft | null => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (!savedDraft) return null;

      const draft: FlowDraft = JSON.parse(savedDraft);
      
      // Verificar se o draft não é muito antigo (7 dias)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
      if (Date.now() - draft.timestamp > maxAge) {
        clearDraft();
        return null;
      }

      return draft;
    } catch (error) {
      console.error('Erro ao carregar draft:', error);
      return null;
    }
  }, []);

  // Limpar draft do localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    console.log('🗑️ Draft removido');
  }, []);

  // Verificar se existe draft válido
  const hasDraft = useCallback((): boolean => {
    const draft = loadDraft();
    return draft !== null;
  }, [loadDraft]);

  // Auto-save com debounce
  const scheduleAutoSave = useCallback((
    flowName: string,
    flowDescription: string,
    nodes: Node[],
    edges: Edge[]
  ) => {
    // Limpar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Agendar novo auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft(flowName, flowDescription, nodes, edges);
    }, AUTO_SAVE_INTERVAL);
  }, [saveDraft]);

  // Cleanup do timeout quando o component for desmontado
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    scheduleAutoSave
  };
};