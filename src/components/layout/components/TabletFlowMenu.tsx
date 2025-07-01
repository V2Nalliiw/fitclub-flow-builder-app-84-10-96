
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Loader2,
  Plus,
  X,
  Shuffle
} from 'lucide-react';
import { FlowNode } from '@/types/flow';
import { useBreakpoints } from '@/hooks/use-breakpoints';

interface TabletFlowMenuProps {
  flowName?: string;
  onFlowNameChange?: (name: string) => void;
  onAddNode?: (type: FlowNode['type']) => void;
  onPreviewFlow?: () => void;
  onSaveFlow?: () => void;
  onClearAllNodes?: () => void;
  onAutoArrange?: () => void;
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
  onAutoArrange = () => {},
  isSaving = false,
  canSave = true
}: TabletFlowMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDesktop } = useBreakpoints();

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
    setIsOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Desktop: menu inline original
  if (isDesktop) {
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
  }

  // Tablet e Mobile: botão flutuante com Sheet
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed top-20 left-4 z-50 bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01] h-14 w-14 p-0 rounded-full shadow-lg"
          title="Abrir menu de ferramentas"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu do Fluxo</h2>
          </div>

          {/* Campo Nome do Fluxo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Fluxo</label>
            <Input
              value={flowName}
              onChange={(e) => onFlowNameChange(e.target.value)}
              placeholder="Nome do fluxo..."
              className="dark:bg-transparent dark:border-gray-700 dark:text-gray-100"
            />
          </div>

          <Separator />

          {/* Seção de Nós */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Adicionar Nós</h3>
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    onClick={() => handleAddNode(nodeType.type)}
                    className="h-12 flex-col gap-1 text-xs"
                  >
                    <IconComponent className={`h-4 w-4 ${nodeType.color}`} />
                    <span>{nodeType.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Ações do Fluxo */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ações</h3>
            <div className="space-y-2">
              {/* Botão Visualizar */}
              <Button
                variant="outline"
                onClick={() => handleAction(onPreviewFlow)}
                className="w-full justify-start"
              >
                <Play className="h-4 w-4 mr-2" />
                Visualizar Fluxo
              </Button>

              {/* Botão Salvar */}
              <Button
                onClick={() => handleAction(onSaveFlow)}
                disabled={!canSave || isSaving}
                className="w-full justify-start bg-[#5D8701] hover:bg-[#4a6e01] text-white dark:bg-[#5D8701] dark:hover:bg-[#4a6e01]"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Fluxo'}
              </Button>

              {/* Botão Organizar */}
              {onAutoArrange && (
                <Button
                  variant="outline"
                  onClick={() => handleAction(onAutoArrange)}
                  className="w-full justify-start"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Organizar Nós
                </Button>
              )}

              {/* Botão Limpar */}
              <Button
                variant="outline"
                onClick={() => handleAction(onClearAllNodes)}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Limpar Todos os Nós
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
