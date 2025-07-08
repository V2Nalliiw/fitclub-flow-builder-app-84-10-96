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
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Plus, Trash2, Info, GitBranch } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { SpecialConditionRule } from '@/types/flow';

// Interface legada para compatibilidade
interface LegacySpecialCondition {
  id: string;
  tipos: ('numerico' | 'pergunta' | 'calculo')[];
  tipoCondicao: 'simples' | 'combinacao';
  campo?: string;
  operador: string;
  valor: string | number;
  valorFinal?: number;
  campos?: {
    tipo: 'numerico' | 'pergunta' | 'calculo';
    campo: string;
    operador: string;
    valor: number | string;
    valorFinal?: number;
  }[];
  operadorCombinacao?: 'AND' | 'OR';
  label: string;
}

interface SpecialConditionsNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const SpecialConditionsNodeConfigNew: React.FC<SpecialConditionsNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [conditions, setConditions] = useState<LegacySpecialCondition[]>([]);

  useEffect(() => {
    if (initialData?.condicoesEspeciais) {
      setConditions(initialData.condicoesEspeciais);
    }
  }, [initialData]);

  const tiposDisponiveis = [
    { id: 'numerico', label: 'Campo Numérico' },
    { id: 'pergunta', label: 'Resposta de Pergunta' },
    { id: 'calculo', label: 'Resultado de Cálculo' }
  ];

  const getOperadoresDisponiveis = (tipos: string[]) => {
    const operadoresNumericos = ['igual', 'maior', 'menor', 'maior_igual', 'menor_igual', 'diferente', 'entre'];
    const operadoresTexto = ['igual', 'diferente', 'contem'];
    
    const temNumerico = tipos.includes('numerico') || tipos.includes('calculo');
    const temTexto = tipos.includes('pergunta');
    
    if (temNumerico && temTexto) {
      return [...new Set([...operadoresNumericos, ...operadoresTexto])];
    } else if (temNumerico) {
      return operadoresNumericos;
    } else if (temTexto) {
      return operadoresTexto;
    }
    
    return operadoresNumericos;
  };

  const operadorLabels = {
    'igual': 'Igual a (=)',
    'maior': 'Maior que (>)',
    'menor': 'Menor que (<)',
    'maior_igual': 'Maior ou igual (≥)',
    'menor_igual': 'Menor ou igual (≤)',
    'diferente': 'Diferente de (≠)',
    'entre': 'Entre X e Y',
    'contem': 'Contém'
  };

  const addCondition = () => {
    const newCondition: LegacySpecialCondition = {
      id: Date.now().toString(),
      tipos: ['numerico'],
      tipoCondicao: 'simples',
      campo: '',
      operador: 'maior',
      valor: '',
      label: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<LegacySpecialCondition>) => {
    setConditions(conditions.map(cond => 
      cond.id === id ? { ...cond, ...updates } : cond
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(cond => cond.id !== id));
  };

  const updateTipos = (conditionId: string, tipo: string, checked: boolean) => {
    setConditions(conditions.map(cond => {
      if (cond.id === conditionId) {
        const newTipos = checked 
          ? [...cond.tipos, tipo as any]
          : cond.tipos.filter(t => t !== tipo);
        
        // Se mudou os tipos, resetar operador para um válido
        const operadoresValidos = getOperadoresDisponiveis(newTipos);
        const operadorAtual = cond.operador;
        const novoOperador = operadoresValidos.includes(operadorAtual) 
          ? operadorAtual 
          : operadoresValidos[0] || 'igual';
        
        return {
          ...cond,
          tipos: newTipos,
          operador: novoOperador,
          tipoCondicao: newTipos.length > 1 ? 'combinacao' : 'simples'
        };
      }
      return cond;
    }));
  };

  const getPreviewText = (condition: LegacySpecialCondition) => {
    if (condition.tipoCondicao === 'combinacao') {
      const tiposText = condition.tipos.map(t => {
        switch(t) {
          case 'numerico': return 'Campo Numérico';
          case 'pergunta': return 'Pergunta';
          case 'calculo': return 'Cálculo';
          default: return t;
        }
      }).join(' + ');
      return `Combinação: ${tiposText}`;
    } else {
      const operadorText = operadorLabels[condition.operador as keyof typeof operadorLabels];
      if (condition.operador === 'entre') {
        return `${condition.campo || '[campo]'} ENTRE ${condition.valor} e ${condition.valorFinal || 0}`;
      }
      return `${condition.campo || '[campo]'} ${operadorText} ${condition.valor}`;
    }
  };

  const handleSave = () => {
    onSave({ condicoesEspeciais: conditions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Condições Especiais</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure condições complexas combinando diferentes tipos de dados. 
              Use condições simples para avaliar um campo ou condições de combinação para múltiplos critérios.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {conditions.length} condição(ões) configurada(s)
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
            <Card key={condition.id} className="border-2">
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
              <CardContent className="space-y-4">
                {/* Seleção de Tipos */}
                <div>
                  <Label className="text-sm font-medium">Tipos de Dados a Combinar</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {tiposDisponiveis.map((tipo) => (
                      <div key={tipo.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${condition.id}-${tipo.id}`}
                          checked={condition.tipos.includes(tipo.id as any)}
                          onCheckedChange={(checked) => 
                            updateTipos(condition.id, tipo.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`${condition.id}-${tipo.id}`}
                          className="text-sm"
                        >
                          {tipo.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campos baseados no tipo de condição */}
                {condition.tipoCondicao === 'simples' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Campo/Nomenclatura</Label>
                      <Input
                        value={condition.campo || ''}
                        onChange={(e) => updateCondition(condition.id, { campo: e.target.value })}
                        placeholder={
                          condition.tipos.includes('numerico') ? 'nomenclatura do campo' :
                          condition.tipos.includes('pergunta') ? 'ID da pergunta' :
                          condition.tipos.includes('calculo') ? 'nome do cálculo' :
                          'campo'
                        }
                        className="mt-1"
                      />
                    </div>

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
                          {getOperadoresDisponiveis(condition.tipos).map((op) => (
                            <SelectItem key={op} value={op}>
                              {operadorLabels[op as keyof typeof operadorLabels]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Valores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor {condition.operador === 'entre' ? 'Inicial' : ''}</Label>
                    <Input
                      value={condition.valor}
                      onChange={(e) => {
                        const isNumeric = condition.tipos.some(t => t === 'numerico' || t === 'calculo');
                        const newValue = isNumeric ? 
                          (parseFloat(e.target.value) || 0) : 
                          e.target.value;
                        updateCondition(condition.id, { valor: newValue });
                      }}
                      type={condition.tipos.some(t => t === 'numerico' || t === 'calculo') ? 'number' : 'text'}
                      placeholder={
                        condition.tipos.some(t => t === 'numerico' || t === 'calculo') ? '0' : 'texto'
                      }
                      className="mt-1"
                    />
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
                </div>

                <div>
                  <Label>Rótulo da Condição</Label>
                  <Input
                    value={condition.label}
                    onChange={(e) => updateCondition(condition.id, { label: e.target.value })}
                    placeholder="Ex: Paciente adulto com peso normal"
                    className="mt-1"
                  />
                </div>

                {/* Preview */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <p className="text-sm mt-1">{getPreviewText(condition)}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {conditions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma condição configurada</p>
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