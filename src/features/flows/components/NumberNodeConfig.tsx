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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface NumberNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const NumberNodeConfig: React.FC<NumberNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [config, setConfig] = useState({
    nomenclatura: '',
    prefixo: '',
    sufixo: '',
    tipoNumero: 'inteiro'
  });

  useEffect(() => {
    if (initialData) {
      setConfig({
        nomenclatura: initialData.nomenclatura || '',
        prefixo: initialData.prefixo || '',
        sufixo: initialData.sufixo || '',
        tipoNumero: initialData.tipoNumero || 'inteiro'
      });
    }
  }, [initialData]);

  const handleSave = () => {
    onSave(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Campo Numérico</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="nomenclatura">Nomenclatura *</Label>
            <Input
              id="nomenclatura"
              value={config.nomenclatura}
              onChange={(e) => setConfig({ ...config, nomenclatura: e.target.value })}
              placeholder="Ex: idade, peso, altura"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nome interno para referência em cálculos
            </p>
          </div>

          <div>
            <Label htmlFor="tipoNumero">Tipo de Número</Label>
            <Select
              value={config.tipoNumero}
              onValueChange={(value) => setConfig({ ...config, tipoNumero: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inteiro">Número Inteiro</SelectItem>
                <SelectItem value="decimal">Número Decimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prefixo">Prefixo (Opcional)</Label>
            <Input
              id="prefixo"
              value={config.prefixo}
              onChange={(e) => setConfig({ ...config, prefixo: e.target.value })}
              placeholder="Ex: R$, kg, cm"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sufixo">Sufixo (Opcional)</Label>
            <Input
              id="sufixo"
              value={config.sufixo}
              onChange={(e) => setConfig({ ...config, sufixo: e.target.value })}
              placeholder="Ex: anos, metros, %"
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.nomenclatura.trim()}
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