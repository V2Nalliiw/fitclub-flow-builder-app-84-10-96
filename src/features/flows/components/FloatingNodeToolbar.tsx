
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
      iconColor: 'text-green-600',
    },
    {
      type: 'question' as FlowNode['type'],
      icon: HelpCircle,
      label: 'Pergunta',
      iconColor: 'text-purple-600',
    },
    {
      type: 'delay' as FlowNode['type'],
      icon: Clock,
      label: 'Aguardar Tempo',
      iconColor: 'text-orange-600',
    },
    {
      type: 'formEnd' as FlowNode['type'],
      icon: FileCheck,
      label: 'Fim de Formulário',
      iconColor: 'text-blue-600',
    },
    {
      type: 'end' as FlowNode['type'],
      icon: Square,
      label: 'Fim do Fluxo',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-card border rounded-lg shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-48'
    }`}>
      <div className="flex items-center justify-between p-2 border-b">
        {!isCollapsed && (
          <span className="text-sm font-medium text-foreground">Adicionar Nós</span>
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
            variant="outline"
            className={`w-full justify-start h-10 ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            title={nodeType.label}
          >
            <nodeType.icon className={`h-4 w-4 flex-shrink-0 ${nodeType.iconColor}`} />
            {!isCollapsed && (
              <span className="ml-2 text-xs truncate">{nodeType.label}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
