
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Play, 
  Square,
  FileText,
  CheckSquare,
  FormInput,
  Clock,
  HelpCircle,
  Eraser,
  Loader2
} from 'lucide-react';
import { FlowNode } from '@/types/flow';

interface TabletFlowMenuProps {
  flowName?: string;
  onFlowNameChange?: (name: string) => void;
  onAddNode?: (type: FlowNode['type']) => void;
  onPreviewFlow?: () => void;
  onSaveFlow?: () => void;
  onClearAllNodes?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

export const TabletFlowMenu = ({
  flowName = "Novo Fluxo",
  onFlowNameChange = () => {},
  onAddNode = () => {},
  onPreviewFlow = () => {},
  onSaveFlow = () => {},
  onClearAllNodes = () => {},
  isSaving = false,
  canSave = true
}: TabletFlowMenuProps) => {
  const nodeTypes = [
    { type: 'end' as FlowNode['type'], label: 'Fim', icon: Square, color: 'text-red-500' },
    { type: 'formStart' as FlowNode['type'], label: 'Form Start', icon: FileText, color: 'text-blue-500' },
    { type: 'formEnd' as FlowNode['type'], label: 'Form End', icon: CheckSquare, color: 'text-purple-500' },
    { type: 'formSelect' as FlowNode['type'], label: 'Form Select', icon: FormInput, color: 'text-indigo-500' },
    { type: 'delay' as FlowNode['type'], label: 'Delay', icon: Clock, color: 'text-orange-500' },
    { type: 'question' as FlowNode['type'], label: 'Question', icon: HelpCircle, color: 'text-yellow-500' },
  ];

  const handleAddNode = (type: FlowNode['type']) => {
    console.log('Adicionando nó do tipo:', type);
    onAddNode(type);
  };

  return (
    <div className="fixed top-[calc(4rem+15px)] left-1/2 transform -translate-x-1/2 z-50 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-full shadow-lg px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Campo Nome do Fluxo */}
        <Input
          value={flowName}
          onChange={(e) => onFlowNameChange(e.target.value)}
          placeholder="Nome do fluxo..."
          className="dark:bg-transparent dark:border-gray-700 dark:text-gray-100 text-sm w-48 h-8 rounded-full px-3"
        />

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Botões de Nós agrupados */}
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          return (
            <Button
              key={nodeType.type}
              variant="outline"
              size="sm"
              onClick={() => handleAddNode(nodeType.type)}
              className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 border-gray-200 hover:bg-gray-50 h-9 w-9 p-0 rounded-full"
              title={nodeType.label}
            >
              <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
            </Button>
          );
        })}

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Botão Visualizar */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviewFlow}
          title="Visualizar fluxo"
          className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 dark:text-gray-300 border-gray-200 hover:bg-gray-50 h-9 w-9 p-0 rounded-full"
        >
          <Play className="h-4 w-4" />
        </Button>

        {/* Botão Salvar */}
        <Button
          onClick={onSaveFlow}
          size="sm"
          disabled={!canSave || isSaving}
          className="bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] h-9 w-9 p-0 rounded-full"
          title="Salvar fluxo"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Botão Limpar */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAllNodes}
          title="Limpar todos os nós"
          className="dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900/50 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 h-9 w-9 p-0 rounded-full"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
