
import React from 'react';
import { FlowBuilderSidebar } from './FlowBuilderSidebar';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { NodeConfigModal } from './NodeConfigModal';
import { useFlowBuilder } from '../hooks/useFlowBuilder';

export const FlowBuilder = () => {
  const {
    nodes,
    edges,
    flowName,
    selectedNode,
    isConfigModalOpen,
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
  } = useFlowBuilder();

  return (
    <div className="h-full flex gap-4">
      <FlowBuilderSidebar
        flowName={flowName}
        selectedNode={selectedNode}
        onFlowNameChange={setFlowName}
        onAddNode={addNode}
        onDeleteNode={deleteNode}
        onClearAllNodes={clearAllNodes}
        onSaveFlow={saveFlow}
      />

      <FlowBuilderCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
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
    </div>
  );
};
