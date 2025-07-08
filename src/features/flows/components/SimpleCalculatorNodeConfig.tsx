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
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Plus, X, HelpCircle } from 'lucide-react';
import { FormulaHelpModal } from './FormulaHelpModal';

interface SimpleCalculatorNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  availableFields?: Array<{ nomenclatura: string; pergunta: string; nodeId: string }>;
}

export const SimpleCalculatorNodeConfig: React.FC<SimpleCalculatorNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableFields = []
}) => {
  const [config, setConfig] = useState({
    operacao: '',
    camposReferenciados: [] as string[],
    resultLabel: ''
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setConfig({
        operacao: initialData.operacao || '',
        camposReferenciados: initialData.camposReferenciados || [],
        resultLabel: initialData.resultLabel || ''
      });
    }
  }, [initialData]);

  const toggleCampo = (nomenclatura: string) => {
    const isSelected = config.camposReferenciados.includes(nomenclatura);
    if (isSelected) {
      setConfig({
        ...config,
        camposReferenciados: config.camposReferenciados.filter(c => c !== nomenclatura)
      });
    } else {
      setConfig({
        ...config,
        camposReferenciados: [...config.camposReferenciados, nomenclatura]
      });
    }
  };

  const insertFieldInFormula = (nomenclatura: string) => {
    const currentFormula = config.operacao;
    const newFormula = currentFormula ? `${currentFormula} ${nomenclatura}` : nomenclatura;
    setConfig({
      ...config,
      operacao: newFormula
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
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="operacao">Operação Matemática *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsHelpOpen(true)}
                className="h-6 w-6 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              id="operacao"
              value={config.operacao}
              onChange={(e) => setConfig({ ...config, operacao: e.target.value })}
              placeholder="Ex: peso / (altura ^ 2) para calcular IMC"
              className="mt-1 font-mono"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use as nomenclaturas selecionadas abaixo e operadores: +, -, *, /, ^, ( )
            </p>
          </div>

          {availableFields.length > 0 ? (
            <div>
              <Label>Campos Conectados Disponíveis</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Selecione os campos que deseja usar na fórmula
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {availableFields.map((field) => (
                  <div key={field.nodeId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={field.nodeId}
                        checked={config.camposReferenciados.includes(field.nomenclatura)}
                        onCheckedChange={() => toggleCampo(field.nomenclatura)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{field.nomenclatura}</span>
                        <span className="text-xs text-muted-foreground">"{field.pergunta}"</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFieldInFormula(field.nomenclatura)}
                      className="text-xs"
                    >
                      Inserir
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {config.camposReferenciados.map((campo, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {campo}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => toggleCampo(campo)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="text-sm">Nenhum campo numérico conectado</p>
              <p className="text-xs">Conecte nós de número a este nó para ver os campos disponíveis</p>
            </div>
          )}

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
      
      <FormulaHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </Dialog>
  );
};