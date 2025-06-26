
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

  // Calcular posições em semicírculo de 180 graus à direita, centralizado no botão principal
  const getIconPosition = (index: number, total: number) => {
    // Criar semicírculo de 180 graus à direita (de -90° até +90°) centrado no botão principal
    const startAngle = -Math.PI / 2; // -90 graus (topo)
    const endAngle = Math.PI / 2;    // +90 graus (baixo)
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (angleStep * index);
    
    // Raio responsivo: maior no desktop, menor no mobile
    const radius = isMobile ? 70 : 100;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  // Tamanhos responsivos para os botões
  const buttonSizes = {
    main: isMobile ? 'h-10 w-10' : 'h-12 w-12',
    secondary: isMobile ? 'h-8 w-8' : 'h-10 w-10',
    icon: isMobile ? 'h-4 w-4' : 'h-5 w-5',
    secondaryIcon: isMobile ? 'h-3 w-3' : 'h-4 w-4',
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
                className={`absolute bg-card border border-border shadow-lg hover:bg-accent ${buttonSizes.secondary} p-0 transition-all duration-200`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={label}
              >
                <Icon className={`${buttonSizes.secondaryIcon} ${color}`} />
              </Button>
            );
          })}
        </div>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="sm"
        className={`bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 ${buttonSizes.main} rounded-full p-0 relative z-10`}
      >
        <Plus className={`${buttonSizes.icon} ${isExpanded ? 'rotate-45' : ''} transition-transform`} />
      </Button>
    </div>
  );
};
