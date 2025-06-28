
import React, { useState, useEffect } from 'react';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { TopToolbar } from './TopToolbar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFlowBuilder as useFlowBuilderFeature } from '../hooks/useFlowBuilder';
import { useFlowBuilder } from '@/hooks/useFlowBuilder';
import { useIsMobile } from '@/hooks/use-mobile';

export const FlowBuilder = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  // Usar o hook principal para salvamento
  const {
    flowName,
    setFlowName,
    flowDescription,
    setFlowDescription,
    nodes: savedNodes,
    setNodes: setSavedNodes,
    edges: savedEdges,
    setEdges: setSavedEdges,
    saveFlow,
    isSaving,
    canSave,
    isEditing
  } = useFlowBuilder();

  // Usar o hook de features para funcionalidades do canvas
  const {
    nodes,
    edges,
    selectedNode,
    isConfigModalOpen,
    isPreviewModalOpen,
    isLoading,
    onNodesChange,
    onEdgesChange,
    onConnect,
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
    openPreview,
    closePreview,
  } = useFlowBuilderFeature();

  // Sincronizar nodes e edges entre os hooks
  useEffect(() => {
    if (savedNodes.length > 0) {
      // Atualizar nodes do canvas com os dados salvos
      console.log('Carregando nodes salvos:', savedNodes);
    }
    if (savedEdges.length > 0) {
      // Atualizar edges do canvas com os dados salvos
      console.log('Carregando edges salvos:', savedEdges);
    }
  }, [savedNodes, savedEdges]);

  // Atualizar dados salvos quando o canvas muda
  useEffect(() => {
    setSavedNodes(nodes);
    setSavedEdges(edges);
  }, [nodes, edges, setSavedNodes, setSavedEdges]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSaveFlow = async () => {
    console.log('Iniciando salvamento do fluxo:', {
      name: flowName,
      description: flowDescription,
      nodes: nodes.length,
      edges: edges.length
    });
    
    await saveFlow();
  };

  const openPreviewModal = () => {
    if (nodes.length === 0) {
      return;
    }
    openPreview();
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  const containerClasses = isFullscreen 
    ? 'fixed inset-0 z-50 bg-background' 
    : isMobile 
      ? 'fixed inset-0 bg-background' 
      : 'w-full h-screen';

  return (
    <div className={`relative overflow-hidden ${containerClasses}`}>
      <FlowBuilderCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
        onDeleteNode={deleteNode}
        onDuplicateNode={duplicateNode}
        isFullscreen={isFullscreen}
      />

      <TopToolbar
        flowName={flowName}
        selectedNode={selectedNode}
        onFlowNameChange={setFlowName}
        onDeleteNode={deleteNode}
        onClearAllNodes={clearAllNodes}
        onAutoArrangeNodes={autoArrangeNodes}
        onSaveFlow={handleSaveFlow}
        onPreviewFlow={openPreviewModal}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onAddNode={addNode}
        isSaving={isSaving}
        canSave={canSave}
      />

      <NodeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedNode(null);
        }}
        node={selectedNode}
        onSave={handleNodeConfigSave}
      />

      <FlowPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={closePreview}
        nodes={nodes}
        edges={edges}
        flowName={flowName}
      />

      {/* Loading Overlay */}
      {(isLoading || isSaving) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <div className="text-sm text-muted-foreground">
              {isSaving ? 'Salvando fluxo...' : 'Processando operação...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
