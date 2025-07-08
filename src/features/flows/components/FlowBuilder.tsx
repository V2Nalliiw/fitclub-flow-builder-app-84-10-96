
import React, { useState } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowBuilder } from '@/hooks/useFlowBuilder';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { FlowBuilderTopMenu } from './FlowBuilderTopMenu';
import { NodeConfigModal } from './NodeConfigModal';
import { FlowPreviewModal } from './FlowPreviewModal';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { FormStartNode } from './nodes/FormStartNode';
import { FormEndNode } from './nodes/FormEndNode';
import { FormSelectNode } from './nodes/FormSelectNode';
import { DelayNode } from './nodes/DelayNode';
import { QuestionNode } from './nodes/QuestionNode';
import CalculatorNode from './nodes/CalculatorNode';
import ConditionsNode from './nodes/ConditionsNode';
import CalculatorNodeConfig from './CalculatorNodeConfig';
import ConditionsNodeConfig from './ConditionsNodeConfig';
import { TabletFlowMenu } from '@/components/layout/components/TabletFlowMenu';
import { useBreakpoints } from '@/hooks/use-breakpoints';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  formStart: FormStartNode,
  formEnd: FormEndNode,
  formSelect: FormSelectNode,
  delay: DelayNode,
  question: QuestionNode,
  calculator: CalculatorNode,
  conditions: ConditionsNode,
};

export const FlowBuilder = () => {
  const { isDesktop } = useBreakpoints();
  const {
    flowName,
    setFlowName,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    isConfigModalOpen,
    setIsConfigModalOpen,
    isPreviewModalOpen,
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
    isEditing,
  } = useFlowBuilder();

  const [isCalculatorConfigOpen, setIsCalculatorConfigOpen] = useState(false);
  const [isConditionsConfigOpen, setIsConditionsConfigOpen] = useState(false);

  const handleNodeConfigModal = () => {
    if (!selectedNode) return;

    if (selectedNode.type === 'calculator') {
      setIsCalculatorConfigOpen(true);
    } else if (selectedNode.type === 'conditions') {
      setIsConditionsConfigOpen(true);
    } else {
      setIsConfigModalOpen(true);
    }
  };

  const handleCalculatorConfigSave = (data: any) => {
    handleNodeConfigSave(data);
    setIsCalculatorConfigOpen(false);
  };

  const handleConditionsConfigSave = (data: any) => {
    handleNodeConfigSave(data);
    setIsConditionsConfigOpen(false);
  };

  // Preparar os nós com as funções de edição e exclusão
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: deleteNode,
      onEdit: () => {
        onNodeClick({} as any, node);
        handleNodeConfigModal();
      }
    }
  }));

  return (
    <div className="h-screen bg-gray-50 dark:bg-none dark:bg-[#0E0E0E]">
      {/* Top Menu - apenas no desktop */}
      {isDesktop && (
        <FlowBuilderTopMenu
          flowName={flowName}
          setFlowName={setFlowName}
          nodeCount={nodes.length}
          onAutoArrange={autoArrangeNodes}
          onClearAll={clearAllNodes}
          onPreview={openPreview}
          onSave={saveFlow}
          onAddNode={addNode}
          isSaving={isSaving}
          canSave={canSave}
          isEditing={isEditing}
        />
      )}

      {/* Menu flutuante para tablet e mobile */}
      {!isDesktop && (
        <TabletFlowMenu
          flowName={flowName}
          onFlowNameChange={setFlowName}
          onAddNode={addNode}
          onPreviewFlow={openPreview}
          onSaveFlow={saveFlow}
          onClearAllNodes={clearAllNodes}
          onAutoArrange={autoArrangeNodes}
          isSaving={isSaving}
          canSave={canSave}
        />
      )}

      {/* Canvas - altura ajustada baseado no breakpoint */}
      <div className={isDesktop ? "h-[calc(100vh-64px)]" : "h-screen"}>
        <FlowBuilderCanvas
          nodes={enhancedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeClick={onNodeClick}
          onDeleteNode={deleteNode}
          onDuplicateNode={() => {}}
        />
      </div>

      {/* Modals */}
      <NodeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        node={selectedNode}
        onSave={handleNodeConfigSave}
      />

      <CalculatorNodeConfig
        isOpen={isCalculatorConfigOpen}
        onClose={() => setIsCalculatorConfigOpen(false)}
        onSave={handleCalculatorConfigSave}
        initialData={selectedNode?.data}
      />

      <ConditionsNodeConfig
        isOpen={isConditionsConfigOpen}
        onClose={() => setIsConditionsConfigOpen(false)}
        onSave={handleConditionsConfigSave}
        initialData={selectedNode?.data}
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
