
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Eraser, Eye, Save, Square, Clock, FileText, CheckCircle, MessageCircle, Calculator, GitBranch, Download, Upload } from 'lucide-react';

interface FlowBuilderTopMenuProps {
  flowName: string;
  setFlowName: (name: string) => void;
  nodeCount: number;
  onAutoArrange: () => void;
  onClearAll: () => void;
  onPreview: () => void;
  onSave: () => void;
  onAddNode: (type: string) => void;
  onExportTemplate: () => void;
  onImportTemplate: () => void;
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
  onAddNode,
  onExportTemplate,
  onImportTemplate,
  isSaving,
  canSave,
  isEditing,
}) => {
  return (
    <div className="bg-white dark:bg-none dark:bg-[#0E0E0E] border-b border-gray-200 dark:border-[#1A1A1A] p-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Nome do fluxo"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="w-64"
        />
        <span className="text-sm text-gray-500">{nodeCount} nós</span>
      </div>

      <div className="flex items-center space-x-1">
        {/* Nós de Controle de Fluxo - Botão início removido */}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('end')}
          title="Fim"
        >
          <Square className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('delay')}
          title="Aguardar"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Nós de Formulários */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('formStart')}
          title="Início Form"
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('formEnd')}
          title="Fim Form"
        >
          <CheckCircle className="h-4 w-4 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('question')}
          title="Pergunta"
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Nós de Lógica e Cálculos */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('calculator')}
          title="Calculadora"
        >
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('conditions')}
          title="Condições"
        >
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Ações */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAutoArrange}
          title="Organizar"
        >
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          title="Apagar todos os nós"
        >
          <Eraser className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          title="Visualizar"
        >
          <Eye className="h-4 w-4 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={!canSave || isSaving}
          title={isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo'}
        >
          <Save className="h-4 w-4 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportTemplate}
          title="Enviar Modelo"
        >
          <Upload className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onImportTemplate}
          title="Baixar Modelo"
        >
          <Download className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
