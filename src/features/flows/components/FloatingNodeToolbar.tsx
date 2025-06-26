
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, Square, FormInput, FileText, Clock, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingNodeToolbarProps {
  onAddNode: (type: string) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({
  onAddNode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const nodeTypes = [
    { type: 'start', icon: Play, label: 'Início', color: 'text-green-600' },
    { type: 'end', icon: Square, label: 'Fim', color: 'text-red-600' },
    { type: 'formStart', icon: FormInput, label: 'Início Formulário', color: 'text-blue-600' },
    { type: 'formEnd', icon: FileText, label: 'Fim Formulário', color: 'text-purple-600' },
    { type: 'formSelect', icon: FileText, label: 'Seleção Formulário', color: 'text-indigo-600' },
    { type: 'delay', icon: Clock, label: 'Delay', color: 'text-orange-600' },
    { type: 'question', icon: HelpCircle, label: 'Pergunta', color: 'text-cyan-600' },
  ];

  const handleAddNode = (type: string) => {
    onAddNode(type);
    setIsOpen(false);
  };

  const buttonSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize = isMobile ? 'w-6 h-6' : 'w-4 h-4';
  const menuItemSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';
  const menuItemIconSize = isMobile ? 'w-5 h-5' : 'w-3 h-3';

  return (
    <div className="relative">
      {/* Main toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`${buttonSize} rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg z-30 relative`}
        title="Adicionar nó"
      >
        <Plus className={`${iconSize} ${isOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
      </Button>

      {/* Node options */}
      {isOpen && (
        <div className={`absolute ${isMobile ? 'top-14 -left-2' : 'top-12 -left-1'} flex flex-col gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-xl min-w-max z-20`}>
          {nodeTypes.map((node) => (
            <Button
              key={node.type}
              onClick={() => handleAddNode(node.type)}
              variant="ghost"
              className={`${menuItemSize} p-0 rounded-lg hover:bg-accent/50 transition-colors group`}
              title={node.label}
            >
              <node.icon className={`${menuItemIconSize} ${node.color} group-hover:scale-110 transition-transform`} />
            </Button>
          ))}
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
