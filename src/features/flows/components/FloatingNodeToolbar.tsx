
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

  // Calcular posições em semicírculo de 180 graus perfeitamente centralizado
  const getIconPosition = (index: number, total: number) => {
    // Semicírculo de 180 graus (de -90° até +90°) centrado no botão principal
    const startAngle = -Math.PI / 2; // -90 graus (topo)
    const endAngle = Math.PI / 2;    // +90 graus (baixo)
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (angleStep * index);
    
    // Raio responsivo: maior no desktop, menor no mobile
    const radius = isMobile ? 80 : 120;
    
    // Calcular posições a partir do centro do botão principal (0,0)
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y };
  };

  // Tamanhos responsivos para os botões
  const buttonSizes = {
    main: isMobile ? 'h-12 w-12' : 'h-14 w-14',
    secondary: isMobile ? 'h-9 w-9' : 'h-11 w-11',
    icon: isMobile ? 'h-5 w-5' : 'h-6 w-6',
    secondaryIcon: isMobile ? 'h-4 w-4' : 'h-5 w-5',
  };

  return (
    <div className="relative">
      {isExpanded && (
        <div className="absolute inset-0">
          {nodeTypes.map(({ type, icon: Icon, label, color }, index) => {
            const { x, y } = getIconPosition(index, nodeTypes.length);
            return (
              <Button
                key={type}
                onClick={() => handleAddNode(type)}
                variant="outline"
                size="sm"
                className={`absolute bg-card/95 backdrop-blur-sm border-2 border-border shadow-xl hover:bg-accent/90 hover:scale-110 ${buttonSizes.secondary} p-0 transition-all duration-300 ease-out hover:shadow-2xl`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  animation: `fadeInScale 0.3s ease-out ${index * 0.05}s both`,
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
        className={`bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 hover:shadow-2xl hover:scale-105 ${buttonSizes.main} rounded-full p-0 relative z-10 transition-all duration-300 ease-out`}
      >
        <Plus className={`${buttonSizes.icon} ${isExpanded ? 'rotate-45' : ''} transition-transform duration-300 ease-out`} />
      </Button>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
