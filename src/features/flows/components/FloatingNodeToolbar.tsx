
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, FileText, FileCheck, Clock, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { FlowNode } from '@/types/flow';

interface FloatingNodeToolbarProps {
  onAddNode: (type: FlowNode['type']) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({ onAddNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nodeTypes = [
    {
      type: 'formStart' as FlowNode['type'],
      icon: Play,
      label: 'Início de Formulário',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      type: 'question' as FlowNode['type'],
      icon: HelpCircle,
      label: 'Pergunta',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      type: 'delay' as FlowNode['type'],
      icon: Clock,
      label: 'Aguardar Tempo',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      type: 'formEnd' as FlowNode['type'],
      icon: FileCheck,
      label: 'Fim de Formulário',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      type: 'end' as FlowNode['type'],
      icon: Square,
      label: 'Fim do Fluxo',
      color: 'bg-red-500 hover:bg-red-600',
    },
  ];

  return (
    <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-48'
    }`}>
      <div className="flex items-center justify-between p-2 border-b">
        {!isCollapsed && (
          <span className="text-sm font-medium text-gray-700">Adicionar Nós</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="p-2 space-y-1">
        {nodeTypes.map((nodeType) => (
          <Button
            key={nodeType.type}
            onClick={() => onAddNode(nodeType.type)}
            variant="ghost"
            className={`w-full justify-start h-10 text-white ${nodeType.color} ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            title={nodeType.label}
          >
            <nodeType.icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-2 text-xs truncate">{nodeType.label}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
