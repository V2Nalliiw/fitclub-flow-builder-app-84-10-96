
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Trash2, Eye, Save } from 'lucide-react';

interface FlowBuilderTopMenuProps {
  flowName: string;
  setFlowName: (name: string) => void;
  nodeCount: number;
  onAutoArrange: () => void;
  onClearAll: () => void;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
  isEditing: boolean;
}

export const FlowBuilderTopMenu: React.FC<FlowBuilderTopMenuProps> = ({
  flowName,
  setFlowName,
  nodeCount,
  onAutoArrange,
  onClearAll,
  onPreview,
  onSave,
  isSaving,
  canSave,
  isEditing,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Nome do fluxo"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="w-64"
        />
        <span className="text-sm text-gray-500">{nodeCount} nós</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAutoArrange}
          title="Organizar"
        >
          <ArrowUpDown className="h-4 w-4 text-blue-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          title="Apagar todos os nós"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          title="Visualizar"
        >
          <Eye className="h-4 w-4 text-green-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={!canSave || isSaving}
          title={isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo'}
        >
          <Save className="h-4 w-4 text-purple-600" />
        </Button>
      </div>
    </div>
  );
};
