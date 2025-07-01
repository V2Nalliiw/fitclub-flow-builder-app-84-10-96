

import React, { useState } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFlowBuilder } from '@/hooks/useFlowBuilder';
import FlowBuilderSidebar from './FlowBuilderSidebar';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
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

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="flow-name" className="text-sm text-gray-700 dark:text-gray-300">
              Nome do Fluxo:
            </Label>
            <Input
              id="flow-name"
              className="mt-1 block w-full sm:text-sm sm:leading-5"
              placeholder="Nome do fluxo"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="flow-description" className="text-sm text-gray-700 dark:text-gray-300">
              Descrição:
            </Label>
            <Textarea
              id="flow-description"
              className="mt-1 block w-full sm:text-sm sm:leading-5"
              placeholder="Descrição do fluxo (opcional)"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={openPreview}>
            Visualizar
          </Button>
          <Button onClick={saveFlow} disabled={!canSave || isSaving}>
            {isSaving ? 'Salvando...' : (isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo')}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <FlowBuilderSidebar
          onAddNode={addNode}
          onClearAll={clearAllNodes}
          onAutoArrange={autoArrangeNodes}
          selectedNode={selectedNode}
          onConfigureNode={handleNodeConfigModal}
          onDeleteNode={deleteNode}
        />

        {/* Canvas */}
        <div className="flex-1 relative">
          <FlowBuilderCanvas
            nodes={nodes}
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

