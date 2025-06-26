
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  FileText, 
  Clock, 
  HelpCircle, 
  FormInput,
  Plus,
  X
} from 'lucide-react';
import { FlowNode } from '@/types/flow';

interface FloatingNodeToolbarProps {
  onAddNode: (type: FlowNode['type']) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({
  onAddNode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypes = [
    {
      type: 'end' as FlowNode['type'],
      icon: Square,
      label: 'Fim',
      description: 'Finaliza o fluxo',
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    {
      type: 'formStart' as FlowNode['type'],
      icon: FileText,
      label: 'Início Form',
      description: 'Inicia formulário',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    {
      type: 'formEnd' as FlowNode['type'],
      icon: FileText,
      label: 'Fim Form',
      description: 'Finaliza formulário',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    {
      type: 'formSelect' as FlowNode['type'],
      icon: FormInput,
      label: 'Form Salvo',
      description: 'Usa formulário salvo',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    },
    {
      type: 'delay' as FlowNode['type'],
      icon: Clock,
      label: 'Aguardar',
      description: 'Pausa no fluxo',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    {
      type: 'question' as FlowNode['type'],
      icon: HelpCircle,
      label: 'Pergunta',
      description: 'Faz uma pergunta',
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <Card className="shadow-lg">
        <CardContent className="p-2">
          {!isExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  Adicionar Nós
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid gap-1 w-32">
                {nodeTypes.map((nodeType) => {
                  const IconComponent = nodeType.icon;
                  return (
                    <Button
                      key={nodeType.type}
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddNode(nodeType.type)}
                      className={`justify-start h-8 px-2 text-xs ${nodeType.color}`}
                      title={nodeType.description}
                    >
                      <IconComponent className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{nodeType.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
