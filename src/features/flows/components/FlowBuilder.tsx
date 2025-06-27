
import React, { useState, useEffect } from 'react';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { TopToolbar } from './TopToolbar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFlowBuilder } from '../hooks/useFlowBuilder';
import { useIsMobile } from '@/hooks/use-mobile';

export const FlowBuilder = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
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
  } = useFlowBuilder();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
        onSaveFlow={saveFlow}
        onPreviewFlow={openPreview}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onAddNode={addNode}
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
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <div className="text-sm text-muted-foreground">
              Processando operação...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
