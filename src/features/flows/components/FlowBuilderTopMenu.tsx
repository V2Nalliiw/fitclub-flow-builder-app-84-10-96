
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
    <div className="fixed top-12 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#1A1A1A] shadow-sm px-4 py-1 flex items-center justify-between h-10">
      <div className="flex items-center space-x-1.5">
        <Input
          placeholder="Nome do fluxo"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="w-44 h-6 text-xs px-2"
        />
        <span className="text-xs text-gray-500">{nodeCount} nós</span>
      </div>

      <div className="flex items-center space-x-0.5">
        {/* Nós de Controle de Fluxo */}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('end')}
          title="Fim"
          className="h-6 w-6 p-0"
        >
          <Square className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('delay')}
          title="Aguardar"
          className="h-6 w-6 p-0"
        >
          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>

        {/* Separador */}
        <div className="w-px h-3 bg-gray-300 mx-0.5" />

        {/* Nós de Formulários */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('formStart')}
          title="Início Form"
          className="h-6 w-6 p-0"
        >
          <FileText className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('formEnd')}
          title="Fim Form"
          className="h-6 w-6 p-0"
        >
          <CheckCircle className="h-2.5 w-2.5 text-primary" />
        </Button>

        {/* Separador */}
        <div className="w-px h-3 bg-gray-300 mx-0.5" />

        {/* Nós de Lógica e Cálculos */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('calculator')}
          title="Calculadora"
          className="h-6 w-6 p-0"
        >
          <Calculator className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode('conditions')}
          title="Condições"
          className="h-6 w-6 p-0"
        >
          <GitBranch className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>

        {/* Separador */}
        <div className="w-px h-3 bg-gray-300 mx-0.5" />

        {/* Ações */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAutoArrange}
          title="Organizar"
          className="h-6 w-6 p-0"
        >
          <ArrowUpDown className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          title="Apagar todos os nós"
          className="h-6 w-6 p-0"
        >
          <Eraser className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          title="Visualizar"
          className="h-6 w-6 p-0"
        >
          <Eye className="h-2.5 w-2.5 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={!canSave || isSaving}
          title={isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo'}
          className="h-6 w-6 p-0"
        >
          <Save className="h-2.5 w-2.5 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportTemplate}
          title="Enviar Modelo"
          className="h-6 w-6 p-0"
        >
          <Upload className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onImportTemplate}
          title="Baixar Modelo"
          className="h-6 w-6 p-0"
        >
          <Download className="h-2.5 w-2.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
