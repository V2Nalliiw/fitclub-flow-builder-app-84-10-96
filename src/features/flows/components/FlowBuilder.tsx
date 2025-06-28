
import React, { useState, useEffect } from 'react';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { TopToolbar } from './TopToolbar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFlowBuilder } from '@/hooks/useFlowBuilder';
import { useIsMobile } from '@/hooks/use-mobile';

export const FlowBuilder = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    flowName,
    setFlowName,
    flowDescription,
    setFlowDescription,
    nodes,
    edges,
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
    isSaving,
    canSave,
  } = useFlowBuilder();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSaveFlow = async () => {
    console.log('FlowBuilder - handleSaveFlow chamado');
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
        onDuplicateNode={() => {}} // Não implementado ainda
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
