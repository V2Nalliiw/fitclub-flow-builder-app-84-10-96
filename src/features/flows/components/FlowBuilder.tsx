
import React from 'react';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { FloatingNodeToolbar } from './FloatingNodeToolbar';
import { TopToolbar } from './TopToolbar';
import { useFlowBuilder } from '../hooks/useFlowBuilder';

export const FlowBuilder = () => {
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
    clearAllNodes,
    onNodeDoubleClick,
    onNodeClick,
    handleNodeConfigSave,
    saveFlow,
    openPreview,
    closePreview,
  } = useFlowBuilder();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <FlowBuilderCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
      />

      <FloatingNodeToolbar onAddNode={addNode} />

      <TopToolbar
        flowName={flowName}
        selectedNode={selectedNode}
        onFlowNameChange={setFlowName}
        onDeleteNode={deleteNode}
        onClearAllNodes={clearAllNodes}
        onSaveFlow={saveFlow}
        onPreviewFlow={openPreview}
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
