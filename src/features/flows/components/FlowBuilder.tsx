
import React, { useState } from 'react';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { FloatingNodeToolbar } from './FloatingNodeToolbar';
import { TopToolbar } from './TopToolbar';
import { useFlowBuilder } from '../hooks/useFlowBuilder';

export const FlowBuilder = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const {
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
  } = useFlowBuilder();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-screen'}`}>
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

      <FloatingNodeToolbar onAddNode={addNode} />

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
    </div>
  );
};
