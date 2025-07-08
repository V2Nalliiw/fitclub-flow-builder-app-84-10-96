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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Plus, Trash2 } from 'lucide-react';

interface SpecialCondition {
  id: string;
  tipo: 'numerico' | 'pergunta';
  campo: string;
  operador: string;
  valor: string | number;
  valorFinal?: number;
  label: string;
}

interface SpecialConditionsNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const SpecialConditionsNodeConfig: React.FC<SpecialConditionsNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [conditions, setConditions] = useState<SpecialCondition[]>([]);

  useEffect(() => {
    if (initialData?.condicoesEspeciais) {
      setConditions(initialData.condicoesEspeciais);
    }
  }, [initialData]);

  const addCondition = () => {
    const newCondition: SpecialCondition = {
      id: Date.now().toString(),
      tipo: 'numerico',
      campo: '',
      operador: 'maior',
      valor: '',
      label: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<SpecialCondition>) => {
    setConditions(conditions.map(cond => 
      cond.id === id ? { ...cond, ...updates } : cond
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(cond => cond.id !== id));
  };

  const handleSave = () => {
    onSave({ condicoesEspeciais: conditions });
  };

  const operadores = [
    { value: 'igual', label: 'Igual a' },
    { value: 'maior', label: 'Maior que' },
    { value: 'menor', label: 'Menor que' },
    { value: 'maior_igual', label: 'Maior ou igual a' },
    { value: 'menor_igual', label: 'Menor ou igual a' },
    { value: 'diferente', label: 'Diferente de' },
    { value: 'entre', label: 'Entre' },
    { value: 'contem', label: 'Contém' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Condições Especiais</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure as condições que determinarão o próximo passo do fluxo
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCondition}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Condição
            </Button>
          </div>

          {conditions.map((condition, index) => (
            <Card key={condition.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Condição {index + 1}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo da Condição</Label>
                    <Select
                      value={condition.tipo}
                      onValueChange={(value: 'numerico' | 'pergunta') => 
                        updateCondition(condition.id, { tipo: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numerico">Campo Numérico</SelectItem>
                        <SelectItem value="pergunta">Resposta de Pergunta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Campo/Pergunta</Label>
                    <Input
                      value={condition.campo}
                      onChange={(e) => updateCondition(condition.id, { campo: e.target.value })}
                      placeholder={condition.tipo === 'numerico' ? 'nomenclatura' : 'ID da pergunta'}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Operador</Label>
                    <Select
                      value={condition.operador}
                      onValueChange={(value) => updateCondition(condition.id, { operador: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operadores
                          .filter(op => condition.tipo === 'pergunta' ? 
                            ['igual', 'diferente', 'contem'].includes(op.value) : 
                            true
                          )
                          .map((op) => (
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
                      value={condition.valor}
                      onChange={(e) => updateCondition(condition.id, { 
                        valor: condition.tipo === 'numerico' ? 
                          (parseFloat(e.target.value) || 0) : 
                          e.target.value 
                      })}
                      type={condition.tipo === 'numerico' ? 'number' : 'text'}
                      placeholder={condition.tipo === 'numerico' ? '0' : 'texto'}
                      className="mt-1"
                    />
                  </div>
                </div>

                {condition.operador === 'entre' && (
                  <div>
                    <Label>Valor Final</Label>
                    <Input
                      value={condition.valorFinal || ''}
                      onChange={(e) => updateCondition(condition.id, { 
                        valorFinal: parseFloat(e.target.value) || 0 
                      })}
                      type="number"
                      placeholder="Valor máximo"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label>Rótulo da Condição</Label>
                  <Input
                    value={condition.label}
                    onChange={(e) => updateCondition(condition.id, { label: e.target.value })}
                    placeholder="Ex: Se maior que 25"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {conditions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma condição configurada</p>
              <p className="text-sm">Clique em "Adicionar Condição" para começar</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={conditions.length === 0}
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