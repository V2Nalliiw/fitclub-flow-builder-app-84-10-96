
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import { ConditionRule } from '@/types/flow';

interface ConditionsNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const ConditionsNodeConfig: React.FC<ConditionsNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [conditions, setConditions] = useState<ConditionRule[]>(initialData?.conditions || []);

  const operadores = [
    { value: 'igual', label: 'Igual a (=)' },
    { value: 'maior', label: 'Maior que (>)' },
    { value: 'menor', label: 'Menor que (<)' },
    { value: 'maior_igual', label: 'Maior ou igual (≥)' },
    { value: 'menor_igual', label: 'Menor ou igual (≤)' },
    { value: 'diferente', label: 'Diferente de (≠)' },
  ];

  const addCondition = () => {
    const newCondition: ConditionRule = {
      id: `condition_${Date.now()}`,
      campo: 'resultado',
      operador: 'maior',
      valor: 0,
      label: `Condição ${conditions.length + 1}`
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (index: number, updates: Partial<ConditionRule>) => {
    const updatedConditions = conditions.map((condition, i) => 
      i === index ? { ...condition, ...updates } : condition
    );
    setConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const data = {
      titulo,
      descricao,
      conditions,
      label: titulo || 'Condições',
    };
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            Configurar Nó Condições
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Avaliação do IMC"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional"
              />
            </div>
          </div>

          {/* Condições */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Condições de Decisão</h3>
              <Button onClick={addCondition} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Condição
              </Button>
            </div>

            {conditions.map((condition, index) => (
              <div key={condition.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Condição {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Campo a Avaliar</Label>
                    <Input
                      value={condition.campo}
                      onChange={(e) => updateCondition(index, { campo: e.target.value })}
                      placeholder="Ex: resultado, peso, idade"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use 'resultado' para o resultado da calculadora ou nomenclaturas dos campos
                    </p>
                  </div>
                  <div>
                    <Label>Rótulo da Condição</Label>
                    <Input
                      value={condition.label}
                      onChange={(e) => updateCondition(index, { label: e.target.value })}
                      placeholder="Ex: Peso Normal, Sobrepeso"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Operador</Label>
                    <Select
                      value={condition.operador}
                      onValueChange={(value: any) => updateCondition(index, { operador: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operadores.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={condition.valor}
                      onChange={(e) => updateCondition(index, { valor: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 25, 18.5"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded text-sm">
                  <strong>Preview:</strong> Se {condition.campo} {operadores.find(op => op.value === condition.operador)?.label.toLowerCase()} {condition.valor}
                </div>
              </div>
            ))}

            {conditions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma condição configurada. Adicione condições para criar caminhos diferentes no fluxo.
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionsNodeConfig;
