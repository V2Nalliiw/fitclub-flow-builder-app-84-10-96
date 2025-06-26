
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FormInput, Timer, HelpCircle, Square } from 'lucide-react';
import { FlowNode } from '@/types/flow';

interface FloatingNodeToolbarProps {
  onAddNode: (type: FlowNode['type']) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({
  onAddNode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypes = [
    { type: 'formStart' as const, icon: FormInput, label: 'Início' },
    { type: 'question' as const, icon: HelpCircle, label: 'Pergunta' },
    { type: 'delay' as const, icon: Timer, label: 'Aguardar' },
    { type: 'formEnd' as const, icon: FormInput, label: 'Fim' },
    { type: 'end' as const, icon: Square, label: 'Finalizar' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    onAddNode(type);
    setIsExpanded(false);
  };

  // Calcular posições em semicírculo
  const getIconPosition = (index: number, total: number) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    const radius = 70;
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30">
      <div className="relative">
        {isExpanded && (
          <div className="absolute">
            {nodeTypes.map(({ type, icon: Icon, label }, index) => {
              const { x, y } = getIconPosition(index, nodeTypes.length);
              return (
                <Button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  variant="outline"
                  size="sm"
                  className="absolute bg-card border border-border shadow-lg hover:bg-accent h-8 w-8 p-0 transition-all duration-200"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={label}
                >
                  <Icon className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-10 w-10 rounded-full p-0 relative z-10"
        >
          <Plus className={`h-5 w-5 ${isExpanded ? 'rotate-45' : ''} transition-transform`} />
        </Button>
      </div>
    </div>
  );
};
