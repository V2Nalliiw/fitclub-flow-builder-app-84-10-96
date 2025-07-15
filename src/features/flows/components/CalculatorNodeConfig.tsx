import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calculator, GripVertical, HelpCircle, Hash } from 'lucide-react';
import { CalculatorField, CalculatorQuestionField } from '@/types/flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  // Unified field list combining both calculation and question fields
  const [allFields, setAllFields] = useState<(CalculatorField | CalculatorQuestionField)[]>(() => {
    const calcFields = (initialData?.calculatorFields || []).map((field: any, index: number) => ({
      ...field,
      fieldType: 'calculo',
      order: field.order ?? index
    }));
    const questFields = (initialData?.calculatorQuestionFields || []).map((field: any, index: number) => ({
      ...field,
      fieldType: 'pergunta',
      order: field.order ?? (calcFields.length + index)
    }));
    
    return [...calcFields, ...questFields].sort((a, b) => a.order - b.order);
  });

  const addCalculatorField = () => {
    const maxOrder = Math.max(...allFields.map(f => f.order), -1);
    const calcFields = allFields.filter(f => f.fieldType === 'calculo');
    const newField: CalculatorField = {
      id: `calc_field_${Date.now()}`,
      nomenclatura: `campo_${calcFields.length + 1}`,
      pergunta: 'Nova pergunta',
      prefixo: '',
      sufixo: '',
      tipo: 'numero',
      fieldType: 'calculo',
      order: maxOrder + 1
    };
    setAllFields([...allFields, newField]);
  };

  const addQuestionField = () => {
    const maxOrder = Math.max(...allFields.map(f => f.order), -1);
    const questFields = allFields.filter(f => f.fieldType === 'pergunta');
    const newField: CalculatorQuestionField = {
      id: `quest_field_${Date.now()}`,
      nomenclatura: `pergunta_${questFields.length + 1}`,
      pergunta: 'Nova pergunta',
      fieldType: 'pergunta',
      questionType: 'escolha-unica',
      opcoes: ['Sim', 'Não'],
      order: maxOrder + 1
    };
    setAllFields([...allFields, newField]);
  };

  const updateField = (index: number, updates: Partial<any>) => {
    const updatedFields = allFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setAllFields(updatedFields as (CalculatorField | CalculatorQuestionField)[]);
  };

  const removeField = (index: number) => {
    setAllFields(allFields.filter((_, i) => i !== index));
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const dragField = allFields[dragIndex];
    const updatedFields = [...allFields];
    updatedFields.splice(dragIndex, 1);
    updatedFields.splice(hoverIndex, 0, dragField);
    
    // Update order based on position
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    setAllFields(reorderedFields);
  };

  const updateQuestionOptions = (fieldIndex: number, options: string[]) => {
    const field = allFields[fieldIndex];
    if (field.fieldType === 'pergunta') {
      updateField(fieldIndex, { opcoes: options });
    }
  };

  const addOption = (fieldIndex: number) => {
    const field = allFields[fieldIndex];
    if (field.fieldType === 'pergunta') {
      const questField = field as CalculatorQuestionField;
      const newOptions = [...questField.opcoes, `Opção ${questField.opcoes.length + 1}`];
      updateQuestionOptions(fieldIndex, newOptions);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = allFields[fieldIndex];
    if (field.fieldType === 'pergunta') {
      const questField = field as CalculatorQuestionField;
      const newOptions = questField.opcoes.filter((_, i) => i !== optionIndex);
      updateQuestionOptions(fieldIndex, newOptions);
    }
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = allFields[fieldIndex];
    if (field.fieldType === 'pergunta') {
      const questField = field as CalculatorQuestionField;
      const newOptions = questField.opcoes.map((opt, i) => i === optionIndex ? value : opt);
      updateQuestionOptions(fieldIndex, newOptions);
    }
  };

  const handleSave = () => {
    const calculatorFields = allFields.filter(f => f.fieldType === 'calculo') as CalculatorField[];
    const calculatorQuestionFields = allFields.filter(f => f.fieldType === 'pergunta') as CalculatorQuestionField[];
    
    const data = {
      titulo,
      descricao,
      resultLabel,
      formula,
      calculatorFields,
      calculatorQuestionFields,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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

          {/* Campos Unificados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Campos da Calculadora</h3>
              <div className="flex gap-2">
                <Button onClick={addCalculatorField} size="sm" variant="outline">
                  <Hash className="h-4 w-4 mr-2" />
                  Campo Cálculo
                </Button>
                <Button onClick={addQuestionField} size="sm" variant="outline">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Campo Pergunta
                </Button>
              </div>
            </div>

            {allFields.map((field, index) => (
              <Card key={field.id} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                      {field.fieldType === 'calculo' ? (
                        <Hash className="h-4 w-4 text-blue-600" />
                      ) : (
                        <HelpCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-500">#{field.order + 1}</span>
                      {field.fieldType === 'calculo' ? 'Campo de Cálculo' : 'Campo de Pergunta'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Nomenclatura {field.fieldType === 'calculo' ? '(para fórmula)' : '(para condições)'}</Label>
                      <Input
                        value={field.nomenclatura}
                        onChange={(e) => updateField(index, { nomenclatura: e.target.value })}
                        placeholder={field.fieldType === 'calculo' ? 'Ex: peso, altura, idade' : 'Ex: quer_emagrecer, pratica_esportes'}
                      />
                    </div>
                    {field.fieldType === 'calculo' ? (
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={(field as CalculatorField).tipo}
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
                    ) : (
                      <div>
                        <Label>Tipo de Pergunta</Label>
                        <Select
                          value={(field as CalculatorQuestionField).questionType}
                          onValueChange={(value: 'escolha-unica' | 'multipla-escolha') => 
                            updateField(index, { questionType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="escolha-unica">Escolha Única (Dropdown)</SelectItem>
                            <SelectItem value="multipla-escolha">Múltipla Escolha (Checkboxes)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Pergunta</Label>
                    <Input
                      value={field.pergunta}
                      onChange={(e) => updateField(index, { pergunta: e.target.value })}
                      placeholder={field.fieldType === 'calculo' ? 'Ex: Qual o seu peso?' : 'Ex: Você quer emagrecer?'}
                    />
                  </div>

                  {field.fieldType === 'calculo' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Prefixo</Label>
                        <Input
                          value={(field as CalculatorField).prefixo || ''}
                          onChange={(e) => updateField(index, { prefixo: e.target.value })}
                          placeholder="Ex: R$"
                        />
                      </div>
                      <div>
                        <Label>Sufixo</Label>
                        <Input
                          value={(field as CalculatorField).sufixo || ''}
                          onChange={(e) => updateField(index, { sufixo: e.target.value })}
                          placeholder="Ex: kg, cm, anos"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Opções de Resposta</Label>
                      {(field as CalculatorQuestionField).opcoes.map((opcao, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            value={opcao}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder="Digite a opção..."
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index, optIndex)}
                            disabled={(field as CalculatorQuestionField).opcoes.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Opção
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {allFields.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum campo configurado. Adicione campos de cálculo e pergunta para usar na calculadora.
              </div>
            )}
          </div>

          {/* Fórmula */}
          {allFields.filter(f => f.fieldType === 'calculo').length > 0 && (
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
                  Use as nomenclaturas dos campos de cálculo. Operadores: +, -, *, /, (), ²
                </p>
                {allFields.filter(f => f.fieldType === 'calculo').length > 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    Campos disponíveis: {allFields.filter(f => f.fieldType === 'calculo').map(f => f.nomenclatura).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

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