
import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { FormStartNode } from './nodes/FormStartNode';
import { FormEndNode } from './nodes/FormEndNode';
import { FormSelectNode } from './nodes/FormSelectNode';
import { DelayNode } from './nodes/DelayNode';
import { QuestionNode } from './nodes/QuestionNode';
import { DeleteEdgeButton } from './DeleteEdgeButton';
import { useIsMobile } from '@/hooks/use-mobile';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  formStart: FormStartNode,
  formEnd: FormEndNode,
  formSelect: FormSelectNode,
  delay: DelayNode,
  question: QuestionNode,
};

const edgeTypes = {
  deleteButton: DeleteEdgeButton,
};

interface FlowBuilderCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: Connection) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  isFullscreen?: boolean;
}

export const FlowBuilderCanvas: React.FC<FlowBuilderCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDoubleClick,
  onNodeClick,
  onDeleteNode,
  onDuplicateNode,
  isFullscreen = false,
}) => {
  const isMobile = useIsMobile();

  const animatedEdges = edges.map(edge => ({
    ...edge,
    animated: true,
    type: 'deleteButton',
    style: {
      stroke: '#9CA3AF',
      strokeWidth: 2,
    },
  }));

  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: onDeleteNode,
      onDuplicate: onDuplicateNode,
    }
  }));

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-white dark:bg-[#0E0E0E]">
      <ReactFlow
        nodes={enhancedNodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-white dark:bg-[#0E0E0E]"
        defaultEdgeOptions={{
          animated: true,
          type: 'deleteButton',
          style: {
            stroke: '#9CA3AF',
            strokeWidth: 2,
          },
        }}
      >
        <Controls 
          position={isMobile ? "bottom-left" : "bottom-right"}
          className="bg-card border border-border rounded-lg shadow-lg [&_button]:bg-card [&_button]:border-border [&_button]:text-foreground hover:[&_button]:bg-accent"
          style={isMobile ? { left: '16px', bottom: '16px' } : {}}
        />
        <MiniMap 
          nodeStrokeColor="hsl(var(--primary))"
          nodeColor="hsl(var(--primary))"
          nodeBorderRadius={8}
          position={isMobile ? "bottom-center" : "bottom-left"}
          className="bg-card border border-border rounded-lg shadow-lg !w-48 !h-36"
          maskColor="hsl(var(--background) / 0.8)"
          style={isMobile ? { 
            left: '50%', 
            transform: 'translateX(-50%)',
            bottom: '16px'
          } : {}}
        />
        <Background 
          gap={16} 
          size={1} 
          color="#D1D5DB" 
          className="bg-white dark:bg-[#0E0E0E] dark:[--xy-background-pattern-color:#374151]"
        />
      </ReactFlow>
    </div>
  );
};
