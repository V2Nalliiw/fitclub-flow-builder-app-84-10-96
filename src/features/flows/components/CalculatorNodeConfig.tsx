
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { CalculatorField } from '@/types/flow';

interface CalculatorNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const CalculatorNodeConfig: React.FC<CalculatorNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [resultLabel, setResultLabel] = useState(initialData?.resultLabel || 'Resultado');
  const [formula, setFormula] = useState(initialData?.formula || '');
  const [fields, setFields] = useState<CalculatorField[]>(initialData?.calculatorFields || []);

  const addField = () => {
    const newField: CalculatorField = {
      id: `field_${Date.now()}`,
      nomenclatura: '',
      pergunta: '',
      prefixo: '',
      sufixo: '',
      tipo: 'numero'
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<CalculatorField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const data = {
      titulo,
      descricao,
      resultLabel,
      formula,
      calculatorFields: fields,
      label: titulo || 'Calculadora',
    };
    onSave(data);
    onClose();
  };

  const formulaTemplates = [
    { label: 'IMC (Índice de Massa Corporal)', formula: 'peso / (altura/100)²' },
    { label: 'Média Simples', formula: '(a + b + c) / 3' },
    { label: 'Porcentagem', formula: '(valor / total) * 100' },
    { label: 'Juros Simples', formula: 'capital * taxa * tempo / 100' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            Configurar Nó Calculadora
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
                placeholder="Ex: Cálculo do IMC"
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
            <div>
              <Label htmlFor="resultLabel">Rótulo do Resultado</Label>
              <Input
                id="resultLabel"
                value={resultLabel}
                onChange={(e) => setResultLabel(e.target.value)}
                placeholder="Ex: Seu IMC é"
              />
            </div>
          </div>

          {/* Campos da Calculadora */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Campos de Entrada</h3>
              <Button onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campo
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Campo {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nomenclatura (para fórmula)</Label>
                    <Input
                      value={field.nomenclatura}
                      onChange={(e) => updateField(index, { nomenclatura: e.target.value })}
                      placeholder="Ex: p, a, idade"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={field.tipo}
                      onValueChange={(value: 'numero' | 'decimal') => updateField(index, { tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numero">Número Inteiro</SelectItem>
                        <SelectItem value="decimal">Número Decimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Pergunta</Label>
                  <Input
                    value={field.pergunta}
                    onChange={(e) => updateField(index, { pergunta: e.target.value })}
                    placeholder="Ex: Qual o seu peso?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prefixo (antes do número)</Label>
                    <Input
                      value={field.prefixo || ''}
                      onChange={(e) => updateField(index, { prefixo: e.target.value })}
                      placeholder="Ex: R$"
                    />
                  </div>
                  <div>
                    <Label>Sufixo (depois do número)</Label>
                    <Input
                      value={field.sufixo || ''}
                      onChange={(e) => updateField(index, { sufixo: e.target.value })}
                      placeholder="Ex: kg, cm, anos"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fórmula */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fórmula de Cálculo</h3>
            
            <div>
              <Label>Templates de Fórmula</Label>
              <Select onValueChange={(value) => setFormula(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um template ou digite sua própria fórmula" />
                </SelectTrigger>
                <SelectContent>
                  {formulaTemplates.map((template, index) => (
                    <SelectItem key={index} value={template.formula}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formula">Fórmula Personalizada</Label>
              <Textarea
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Ex: peso / (altura/100)² ou (a + b + c) / 3"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use as nomenclaturas dos campos. Operadores: +, -, *, /, (), ²
              </p>
            </div>
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

export default CalculatorNodeConfig;
