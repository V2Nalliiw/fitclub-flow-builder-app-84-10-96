
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
    { type: 'formStart' as const, icon: FormInput, label: 'Início', color: 'text-green-600' },
    { type: 'question' as const, icon: HelpCircle, label: 'Pergunta', color: 'text-blue-600' },
    { type: 'delay' as const, icon: Timer, label: 'Aguardar', color: 'text-orange-600' },
    { type: 'formEnd' as const, icon: FormInput, label: 'Fim', color: 'text-green-600' },
    { type: 'end' as const, icon: Square, label: 'Finalizar', color: 'text-red-600' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    onAddNode(type);
    setIsExpanded(false);
  };

  // Calcular posições em semicírculo de 180 graus à direita
  const getIconPosition = (index: number, total: number) => {
    // Criar semicírculo de 180 graus à direita (de -90° até +90°)
    const startAngle = -Math.PI / 2; // -90 graus (topo)
    const endAngle = Math.PI / 2;    // +90 graus (baixo)
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (angleStep * index);
    const radius = 80; // Aumentar raio para evitar sobreposição
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <div className="relative">
      {isExpanded && (
        <div className="absolute">
          {nodeTypes.map(({ type, icon: Icon, label, color }, index) => {
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
                <Icon className={`h-3 w-3 ${color}`} />
              </Button>
            );
          })}
        </div>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="sm"
        className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-8 w-8 rounded-full p-0 relative z-10"
      >
        <Plus className={`h-4 w-4 ${isExpanded ? 'rotate-45' : ''} transition-transform`} />
      </Button>
    </div>
  );
};
