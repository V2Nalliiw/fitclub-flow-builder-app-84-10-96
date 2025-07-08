import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface FlowTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  flowData?: {
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
  };
  onImport?: (templateData: any) => void;
}

export const FlowTemplateManager: React.FC<FlowTemplateManagerProps> = ({
  isOpen,
  onClose,
  mode,
  flowData,
  onImport,
}) => {
  const [templateName, setTemplateName] = useState(flowData?.name || '');
  const [templateDescription, setTemplateDescription] = useState(flowData?.description || '');

  const handleExport = async () => {
    if (!flowData) return;

    try {
      const templateData = {
        name: templateName || 'Modelo de Fluxo',
        description: templateDescription || '',
        version: '1.0',
        nodes: flowData.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            // Remove funções e dados específicos da instância
            onDelete: undefined,
            onEdit: undefined,
          }
        })),
        edges: flowData.edges,
        metadata: {
          exportedAt: new Date().toISOString(),
          nodeCount: flowData.nodes.length,
          edgeCount: flowData.edges.length,
        }
      };

      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Modelo exportado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao exportar modelo:', error);
      toast.error('Erro ao exportar modelo');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const templateData = JSON.parse(text);
      
      // Validar estrutura do template
      if (!templateData.nodes || !templateData.edges) {
        toast.error('Arquivo de modelo inválido');
        return;
      }
      
      if (onImport) {
        onImport(templateData);
      }
      
      toast.success(`Modelo "${templateData.name}" importado com sucesso!`);
      onClose();
    } catch (error) {
      console.error('Erro ao importar modelo:', error);
      toast.error('Erro ao importar modelo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'export' ? (
              <>
                <Upload className="h-5 w-5" />
                Enviar Modelo de Fluxo
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Baixar Modelo de Fluxo
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'export' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Modelo</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Digite o nome do modelo..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Descreva o que este modelo faz..."
                  rows={3}
                />
              </div>

              {flowData && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Resumo do Fluxo:</h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      <span>{flowData.nodes.length} nós</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>{flowData.edges.length} conexões</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Exportado em {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleExport} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecionar Arquivo de Modelo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Escolha um arquivo JSON de modelo de fluxo para importar
                </p>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="file-input"
                />
                
                <Label htmlFor="file-input" asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Escolher Arquivo
                  </Button>
                </Label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Atenção:</strong> Importar um modelo substituirá o fluxo atual. 
                  Certifique-se de salvar seu trabalho antes de continuar.
                </p>
              </div>

              <Button variant="outline" onClick={onClose} className="w-full">
                Cancelar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};