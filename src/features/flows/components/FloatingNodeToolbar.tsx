
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FormInput, Timer, HelpCircle, Square } from 'lucide-react';
import { FlowNode } from '@/types/flow';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingNodeToolbarProps {
  onAddNode: (type: FlowNode['type']) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({
  onAddNode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

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

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col items-center gap-2">
        {isExpanded && (
          <div className="flex flex-col gap-2 mb-2">
            {nodeTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                onClick={() => handleAddNode(type)}
                variant="outline"
                size="sm"
                className="bg-card border border-border shadow-lg hover:bg-accent h-10 w-10 p-0"
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-12 w-12 rounded-full p-0"
        >
          <Plus className={`h-6 w-6 ${isExpanded ? 'rotate-45' : ''} transition-transform`} />
        </Button>
      </div>
    </div>
  );
};
