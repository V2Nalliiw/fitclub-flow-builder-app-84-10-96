
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    { 
      type: 'formStart' as const, 
      icon: FormInput, 
      label: 'Início', 
      color: 'text-green-600',
      description: 'Inicia um formulário dinâmico'
    },
    { 
      type: 'question' as const, 
      icon: HelpCircle, 
      label: 'Pergunta', 
      color: 'text-blue-600',
      description: 'Adiciona uma pergunta interativa'
    },
    { 
      type: 'delay' as const, 
      icon: Timer, 
      label: 'Aguardar', 
      color: 'text-orange-600',
      description: 'Pausa o fluxo por um tempo'
    },
    { 
      type: 'formEnd' as const, 
      icon: FormInput, 
      label: 'Fim', 
      color: 'text-green-600',
      description: 'Finaliza um formulário'
    },
    { 
      type: 'end' as const, 
      icon: Square, 
      label: 'Finalizar', 
      color: 'text-red-600',
      description: 'Encerra o fluxo completamente'
    },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    onAddNode(type);
    setIsExpanded(false);
  };

  const getIconPosition = (index: number, total: number) => {
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (angleStep * index);
    
    const radius = isMobile ? 90 : 130;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y };
  };

  const buttonSizes = {
    main: isMobile ? 'h-12 w-12' : 'h-16 w-16',
    secondary: isMobile ? 'h-10 w-10' : 'h-12 w-12',
    icon: isMobile ? 'h-5 w-5' : 'h-7 w-7',
    secondaryIcon: isMobile ? 'h-4 w-4' : 'h-6 w-6',
  };

  return (
    <TooltipProvider>
      <div className="relative">
        {isExpanded && (
          <div className="absolute inset-0">
            {nodeTypes.map(({ type, icon: Icon, label, color, description }, index) => {
              const { x, y } = getIconPosition(index, nodeTypes.length);
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAddNode(type)}
                      variant="outline"
                      size="sm"
                      className={`absolute bg-card/95 backdrop-blur-sm border-2 border-border shadow-xl hover:bg-accent/90 hover:scale-110 ${buttonSizes.secondary} p-0 transition-all duration-300 ease-out hover:shadow-2xl`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        animation: `fadeInScale 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <Icon className={`${buttonSizes.secondaryIcon} ${color}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="text-center">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {description}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              className={`bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 hover:shadow-2xl hover:scale-105 ${buttonSizes.main} rounded-full p-0 relative z-10 transition-all duration-300 ease-out`}
            >
              <Plus className={`${buttonSizes.icon} ${isExpanded ? 'rotate-45' : ''} transition-transform duration-300 ease-out`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="text-center">
              <div className="font-medium">
                {isExpanded ? 'Fechar Menu' : 'Adicionar Nó'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isExpanded ? 'Clique para fechar' : 'Clique para ver opções'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <style>{`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
};
