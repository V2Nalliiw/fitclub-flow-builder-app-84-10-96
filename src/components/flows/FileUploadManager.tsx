import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload } from 'lucide-react';
import { FileUploadConfig } from '@/types/flow';

interface FileUploadManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: FileUploadConfig[];
  onSave: (files: FileUploadConfig[]) => void;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  isOpen,
  onClose,
  initialFiles = [],
  onSave,
}) => {
  const [files, setFiles] = useState<FileUploadConfig[]>(
    initialFiles.length > 0 ? initialFiles : [
      {
        id: '1',
        label: 'Documento Principal',
        tipoArquivo: 'pdf',
        obrigatorio: true,
        multiplos: false,
      }
    ]
  );

  const addFile = () => {
    const newFile: FileUploadConfig = {
      id: Date.now().toString(),
      label: `Arquivo ${files.length + 1}`,
      tipoArquivo: 'qualquer',
      obrigatorio: false,
      multiplos: false,
    };
    setFiles([...files, newFile]);
  };

  const updateFile = (id: string, field: keyof FileUploadConfig, value: any) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (id: string) => {
    if (files.length > 1) {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  const handleSave = () => {
    onSave(files);
    onClose();
  };

  const tiposArquivo = [
    { value: 'pdf', label: 'PDF' },
    { value: 'imagem', label: 'Imagem' },
    { value: 'video', label: 'Vídeo' },
    { value: 'documento', label: 'Documento' },
    { value: 'qualquer', label: 'Qualquer' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Configurar Uploads de Arquivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Configure os arquivos que o paciente deve enviar ao completar este formulário.
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Arquivo {index + 1}</h4>
                  {files.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rótulo do Arquivo</Label>
                    <Input
                      value={file.label}
                      onChange={(e) => updateFile(file.id, 'label', e.target.value)}
                      placeholder="Ex: Receita médica"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Arquivo</Label>
                    <Select
                      value={file.tipoArquivo}
                      onValueChange={(value) => updateFile(file.id, 'tipoArquivo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposArquivo.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`obrigatorio-${file.id}`}
                      checked={file.obrigatorio}
                      onCheckedChange={(checked) => updateFile(file.id, 'obrigatorio', checked)}
                    />
                    <Label htmlFor={`obrigatorio-${file.id}`}>Obrigatório</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`multiplos-${file.id}`}
                      checked={file.multiplos}
                      onCheckedChange={(checked) => updateFile(file.id, 'multiplos', checked)}
                    />
                    <Label htmlFor={`multiplos-${file.id}`}>Múltiplos arquivos</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addFile}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Arquivo
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};