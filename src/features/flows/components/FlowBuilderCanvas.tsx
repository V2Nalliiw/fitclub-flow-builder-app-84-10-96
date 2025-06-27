
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
import { useBreakpoints } from '@/hooks/use-breakpoints';

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
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

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

  const canvasHeight = isFullscreen || isMobile ? '100vh' : 'calc(100vh - 4rem)';
  const canvasWidth = '100%';

  return (
    <div 
      className="relative bg-white dark:bg-[#0E0E0E]"
      style={{ 
        height: canvasHeight,
        width: canvasWidth
      }}
    >
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
        minZoom={isMobile ? 0.3 : 0.5}
        maxZoom={isMobile ? 1.5 : 2}
        attributionPosition="bottom-right"
        panOnScroll={false}
        panOnScrollSpeed={0.5}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
      >
        <Controls 
          position={isMobile ? "bottom-left" : "bottom-right"}
          className={`bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-xl [&_button]:bg-card/80 [&_button]:border-border [&_button]:text-foreground hover:[&_button]:bg-accent/90 [&_button]:backdrop-blur-sm [&_button]:transition-all [&_button]:duration-200 ${isMobile ? 'scale-90' : ''}`}
          style={isMobile ? { 
            bottom: '80px', 
            left: '12px',
            zIndex: 10
          } : {}}
        />
        <MiniMap 
          nodeStrokeColor="hsl(var(--primary))"
          nodeColor="hsl(var(--primary)/0.8)"
          nodeBorderRadius={12}
          position={isMobile ? "bottom-center" : "bottom-left"}
          className={`bg-card/95 backdrop-blur-sm border-2 border-border/50 rounded-xl shadow-xl overflow-hidden ${isMobile ? '!w-32 !h-20' : '!w-56 !h-40'}`}
          maskColor="hsl(var(--background) / 0.7)"
          pannable
          zoomable
          style={isMobile ? { 
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          } : {}}
        />
        <Background 
          gap={16} 
          size={1} 
          color="hsl(var(--muted-foreground) / 0.3)" 
          className="bg-gray-50/50 dark:bg-[#0E0E0E]"
        />
      </ReactFlow>
    </div>
  );
};
