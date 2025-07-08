import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, X } from 'lucide-react';

interface SimpleCalculatorNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const SimpleCalculatorNodeConfig: React.FC<SimpleCalculatorNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [config, setConfig] = useState({
    operacao: '',
    camposReferenciados: [] as string[],
    resultLabel: ''
  });
  const [newCampo, setNewCampo] = useState('');

  useEffect(() => {
    if (initialData) {
      setConfig({
        operacao: initialData.operacao || '',
        camposReferenciados: initialData.camposReferenciados || [],
        resultLabel: initialData.resultLabel || ''
      });
    }
  }, [initialData]);

  const addCampo = () => {
    if (newCampo.trim() && !config.camposReferenciados.includes(newCampo.trim())) {
      setConfig({
        ...config,
        camposReferenciados: [...config.camposReferenciados, newCampo.trim()]
      });
      setNewCampo('');
    }
  };

  const removeCampo = (campo: string) => {
    setConfig({
      ...config,
      camposReferenciados: config.camposReferenciados.filter(c => c !== campo)
    });
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Cálculo Simples</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="operacao">Operação Matemática *</Label>
            <Textarea
              id="operacao"
              value={config.operacao}
              onChange={(e) => setConfig({ ...config, operacao: e.target.value })}
              placeholder="Ex: peso / (altura * altura)"
              className="mt-1 font-mono"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use as nomenclaturas dos campos numéricos e operadores: +, -, *, /, ( )
            </p>
          </div>

          <div>
            <Label>Campos Referenciados</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newCampo}
                onChange={(e) => setNewCampo(e.target.value)}
                placeholder="Nomenclatura do campo"
                onKeyPress={(e) => e.key === 'Enter' && addCampo()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCampo}
                disabled={!newCampo.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {config.camposReferenciados.map((campo, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {campo}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeCampo(campo)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="resultLabel">Rótulo do Resultado</Label>
            <Input
              id="resultLabel"
              value={config.resultLabel}
              onChange={(e) => setConfig({ ...config, resultLabel: e.target.value })}
              placeholder="Ex: IMC, Total, Resultado"
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.operacao.trim()}
              className="bg-[#5D8701] hover:bg-[#4a6e01]"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};