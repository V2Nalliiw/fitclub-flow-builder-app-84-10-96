
import React, { useState } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
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
import NumberNode from './nodes/NumberNode';
import SimpleCalculatorNode from './nodes/SimpleCalculatorNode';
import CalculatorNodeConfig from './CalculatorNodeConfig';
import ConditionsNodeConfig from './ConditionsNodeConfig';
import { NumberNodeConfig } from './NumberNodeConfig';
import { SimpleCalculatorNodeConfig } from './SimpleCalculatorNodeConfig';

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
  number: NumberNode,
  simpleCalculator: SimpleCalculatorNode,
};

// Debug: Log dos tipos de nós registrados
console.log('=== Tipos de nós registrados no FlowBuilder ===', {
  nodeTypes: Object.keys(nodeTypes),
  NumberNode: !!NumberNode,
  SimpleCalculatorNode: !!SimpleCalculatorNode
});

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
    duplicateNode,
    clearAllNodes,
    autoArrangeNodes,
    onNodeDoubleClick,
    onNodeClick,
    handleNodeConfigSave,
    openPreview,
    closePreview,
    saveFlow,
    exportTemplate,
    importTemplate,
    isSaving,
    canSave,
    isEditing,
  } = useFlowBuilder();

  // Modificar onNodeDoubleClick para abrir o modal correto
  const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    console.log('🖱️ Double click on node:', node.id, 'type:', node.type);
    console.log('📊 Node data:', node.data);
    onNodeClick(event, node);
    
    // Usar setTimeout para garantir que selectedNode seja atualizado primeiro
    setTimeout(() => {
      handleNodeConfigModal();
    }, 50);
  };

  const [isCalculatorConfigOpen, setIsCalculatorConfigOpen] = useState(false);
  const [isConditionsConfigOpen, setIsConditionsConfigOpen] = useState(false);
  const [isNumberConfigOpen, setIsNumberConfigOpen] = useState(false);
  const [isSimpleCalculatorConfigOpen, setIsSimpleCalculatorConfigOpen] = useState(false);

  const handleNodeConfigModal = () => {
    console.log('⚙️ handleNodeConfigModal called with selectedNode:', selectedNode);
    
    if (!selectedNode) {
      console.log('❌ No selectedNode found!');
      return;
    }

    console.log('🎯 Opening modal for node type:', selectedNode.type);
    
    if (selectedNode.type === 'calculator') {
      console.log('🧮 Opening calculator config modal');
      setIsCalculatorConfigOpen(true);
    } else if (selectedNode.type === 'conditions') {
      console.log('🧩 Opening conditions config modal');
      setIsConditionsConfigOpen(true);
    } else if (selectedNode.type === 'number') {
      setIsNumberConfigOpen(true);
    } else if (selectedNode.type === 'simpleCalculator') {
      setIsSimpleCalculatorConfigOpen(true);
    } else {
      setIsConfigModalOpen(true);
    }
  };

  const handleCalculatorConfigSave = (data: any) => {
    console.log('🧮 FlowBuilder handleCalculatorConfigSave called with data:', data);
    console.log('📝 Selected node for calculator:', selectedNode);
    handleNodeConfigSave(data);
    setIsCalculatorConfigOpen(false);
  };

  const handleConditionsConfigSave = (data: any) => {
    console.log('🧩 FlowBuilder handleConditionsConfigSave called with data:', data);
    console.log('📝 Selected node for conditions:', selectedNode);
    handleNodeConfigSave(data);
    setIsConditionsConfigOpen(false);
  };

  const handleNumberConfigSave = (data: any) => {
    handleNodeConfigSave(data);
    setIsNumberConfigOpen(false);
  };

  const handleSimpleCalculatorConfigSave = (data: any) => {
    handleNodeConfigSave(data);
    setIsSimpleCalculatorConfigOpen(false);
  };

  // Função para obter campos numéricos conectados a um nó
  const getConnectedNumberFields = (nodeId: string) => {
    if (!nodeId) return [];
    
    // Encontrar todas as edges que chegam ao nó atual
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    const sourceNodeIds = incomingEdges.map(edge => edge.source);
    
    // Filtrar nós de origem que são do tipo 'number'
    const numberNodes = nodes.filter(node => 
      sourceNodeIds.includes(node.id) && 
      node.type === 'number' &&
      node.data.nomenclatura &&
      node.data.pergunta
    );
    
    return numberNodes.map(node => ({
      nomenclatura: node.data.nomenclatura as string,
      pergunta: node.data.pergunta as string,
      nodeId: node.id
    }));
  };

  // Função para obter campos de calculadora conectados a um nó
  const getConnectedCalculatorFields = (nodeId: string) => {
    if (!nodeId) return { calculations: [], questions: [] };
    
    console.log('🔍 Getting connected calculator fields for node:', nodeId);
    
    // Função recursiva para encontrar todos os nós anteriores ao nó atual
    const getAllPreviousNodes = (currentNodeId: string, visited: Set<string> = new Set()): string[] => {
      if (visited.has(currentNodeId)) return [];
      visited.add(currentNodeId);
      
      const incomingEdges = edges.filter(edge => edge.target === currentNodeId);
      const sourceNodeIds = incomingEdges.map(edge => edge.source);
      
      let allPreviousIds = [...sourceNodeIds];
      
      // Recursivamente buscar nós anteriores aos nós de origem
      sourceNodeIds.forEach(sourceId => {
        allPreviousIds.push(...getAllPreviousNodes(sourceId, visited));
      });
      
      return allPreviousIds;
    };
    
    // Obter todos os nós anteriores ao nó atual
    const allPreviousNodeIds = getAllPreviousNodes(nodeId);
    
    console.log('🎯 All previous node IDs:', allPreviousNodeIds);
    
    // Filtrar nós que são do tipo 'calculator'
    const calculatorNodes = nodes.filter(node => 
      allPreviousNodeIds.includes(node.id) && 
      node.type === 'calculator'
    );
    
    console.log('🧮 Found calculator nodes:', calculatorNodes);
    
    const calculations: Array<{ nomenclatura: string; label: string; type: 'number' | 'decimal'; isFormulaResult?: boolean }> = [];
    const questions: Array<{ nomenclatura: string; label: string; type: 'single' | 'multiple'; opcoes?: string[] }> = [];
    
    calculatorNodes.forEach(calcNode => {
      console.log('🔎 Processing calculator node:', calcNode.id, calcNode.data);
      
      // Extrair campos de cálculo
      if (calcNode.data.calculatorFields) {
        const calcFields = calcNode.data.calculatorFields as any[];
        calcFields.forEach(field => {
          if (field.nomenclatura && field.pergunta) {
            calculations.push({
              nomenclatura: field.nomenclatura,
              label: field.pergunta,
              type: field.tipo === 'decimal' ? 'decimal' : 'number'
            });
          }
        });
      }
      
      // Extrair o resultado da fórmula se existir
      if (calcNode.data.formula && calcNode.data.resultLabel) {
        calculations.push({
          nomenclatura: 'formula_result',
          label: `Resultado: ${calcNode.data.resultLabel}`,
          type: 'decimal',
          isFormulaResult: true
        });
        console.log('🧮 Added formula result field:', calcNode.data.resultLabel);
      }
      
      // Extrair campos de pergunta com suas opções
      if (calcNode.data.calculatorQuestionFields) {
        const questionFields = calcNode.data.calculatorQuestionFields as any[];
        questionFields.forEach(field => {
          if (field.nomenclatura && field.pergunta) {
            questions.push({
              nomenclatura: field.nomenclatura,
              label: field.pergunta,
              type: field.questionType === 'multipla-escolha' ? 'multiple' : 'single',
              opcoes: field.opcoes || []
            });
          }
        });
      }
    });
    
    console.log('📊 Final calculations:', calculations);
    console.log('❓ Final questions:', questions);
    
    return { calculations, questions };
  };

  // Preparar os nós com as funções de edição e exclusão
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: deleteNode,
      onDuplicate: duplicateNode,
      onEdit: () => {
        console.log('✏️ Edit button clicked for node:', node.id, 'type:', node.type);
        onNodeClick({} as any, node);
        // Usar setTimeout para garantir que selectedNode seja atualizado primeiro
        setTimeout(() => {
          handleNodeConfigModal();
        }, 50);
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
          onExportTemplate={exportTemplate}
          onImportTemplate={importTemplate}
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
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={onNodeClick}
          onDeleteNode={deleteNode}
          onDuplicateNode={duplicateNode}
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
        availableCalculations={(() => {
          const { calculations } = getConnectedCalculatorFields(selectedNode?.id || '');
          return calculations.map(calc => ({ 
            nomenclatura: calc.nomenclatura, 
            label: calc.label 
          }));
        })()}
        availableQuestions={(() => {
          const { questions } = getConnectedCalculatorFields(selectedNode?.id || '');
          console.log('🔍 Building available questions for conditions:', questions);
          const mapped = questions.map(quest => ({ 
            nomenclatura: quest.nomenclatura, 
            pergunta: quest.label, // Usar label da pergunta
            opcoes: quest.opcoes || [],
            respostasDisponiveis: quest.opcoes || [] // Respostas disponíveis são as mesmas opções
          }));
          console.log('📋 Mapped questions with answers:', mapped);
          return mapped;
        })()}
      />

      <NumberNodeConfig
        isOpen={isNumberConfigOpen}
        onClose={() => setIsNumberConfigOpen(false)}
        onSave={handleNumberConfigSave}
        initialData={selectedNode?.data}
      />

      <SimpleCalculatorNodeConfig
        isOpen={isSimpleCalculatorConfigOpen}
        onClose={() => setIsSimpleCalculatorConfigOpen(false)}
        onSave={handleSimpleCalculatorConfigSave}
        initialData={selectedNode?.data}
        availableFields={getConnectedNumberFields(selectedNode?.id || '')}
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
