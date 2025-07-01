
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
import CalculatorNode from './nodes/CalculatorNode';
import ConditionsNode from './nodes/ConditionsNode';
import { SimpleDeleteEdge } from './SimpleDeleteEdge';
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

const edgeTypes = {
  deleteButton: SimpleDeleteEdge,
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

  // Configurar edges com o tipo correto
  const enhancedEdges = edges.map(edge => ({
    ...edge,
    animated: true,
    type: 'deleteButton',
    style: {
      stroke: '#9CA3AF',
      strokeWidth: 2,
    },
  }));

  const canvasHeight = isFullscreen || isMobile ? '100vh' : 'calc(100vh - 4rem)';
  const canvasWidth = '100%';

  return (
    <div 
      className="relative bg-gray-50 dark:bg-[#0E0E0E]"
      style={{ 
        height: canvasHeight,
        width: canvasWidth
      }}
    >
      <style>{`
        .react-flow__handle {
          border: 2px solid white !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s ease !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .react-flow__handle:hover {
          transform: scale(1.2) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
        }
        
        .react-flow__handle.connecting {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
        }
        
        .react-flow__handle.connectionindicator {
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3) !important;
        }
        
        /* Melhorar visibilidade dos handles múltiplos */
        .react-flow__node-question .react-flow__handle,
        .react-flow__node-conditions .react-flow__handle {
          opacity: 1 !important;
          visibility: visible !important;
          z-index: 10 !important;
        }
        
        /* Handles específicos para nós de condições */
        .react-flow__node-conditions .react-flow__handle[data-handleid^="condition-"] {
          border: 3px solid white !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Handles específicos para nós de pergunta */
        .react-flow__node-question .react-flow__handle[data-handleid^="opcao-"] {
          border: 3px solid white !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Feedback visual para conexões */
        .react-flow__edge.selected {
          stroke: #3b82f6 !important;
          stroke-width: 3px !important;
        }
        
        .react-flow__edge:hover {
          stroke: #6b7280 !important;
          stroke-width: 3px !important;
        }
        
        /* Melhorar contraste dos handles */
        .react-flow__handle.react-flow__handle-top,
        .react-flow__handle.react-flow__handle-bottom,
        .react-flow__handle.react-flow__handle-left,
        .react-flow__handle.react-flow__handle-right {
          border: 2px solid white !important;
          min-width: 12px !important;
          min-height: 12px !important;
        }
        
        /* Handles dinâmicos com melhor visibilidade */
        .react-flow__handle[style*="position: absolute"] {
          position: absolute !important;
          z-index: 20 !important;
          pointer-events: all !important;
        }
      `}</style>
      
      <ReactFlow
        nodes={nodes}
        edges={enhancedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50 dark:bg-[#0E0E0E]"
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
        connectionLineStyle={{
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
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
          position={isMobile || isTablet ? "bottom-center" : "bottom-left"}
          className={`bg-card/95 backdrop-blur-sm border-2 border-border/50 rounded-xl shadow-xl overflow-hidden ${isMobile ? '!w-32 !h-20' : '!w-56 !h-40'}`}
          maskColor="hsl(var(--background) / 0.7)"
          pannable
          zoomable
          style={(isMobile || isTablet) ? { 
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          } : {}}
        />
        <Background 
          gap={16} 
          size={1.5} 
          color="hsl(var(--muted-foreground) / 0.6)" 
          className="bg-gray-50 dark:bg-[#0E0E0E]"
        />
      </ReactFlow>
    </div>
  );
};
