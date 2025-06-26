
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Save, Eye, Settings } from 'lucide-react';
import { FormField } from '../hooks/useFormManager';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface FormBuilderProps {
  initialFields?: FormField[];
  formName?: string;
  formDescription?: string;
  onSave: (name: string, description: string, fields: FormField[]) => void;
  onPreview: (fields: FormField[]) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialFields = [],
  formName = '',
  formDescription = '',
  onSave,
  onPreview,
}) => {
  const [name, setName] = useState(formName);
  const [description, setDescription] = useState(formDescription);
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [editingField, setEditingField] = useState<string | null>(null);

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Lista Suspensa' },
    { value: 'radio', label: 'Escolha Única' },
    { value: 'checkbox', label: 'Múltipla Escolha' },
    { value: 'file', label: 'Upload de Arquivo' },
  ];

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `Novo Campo ${fieldTypes.find(t => t.value === type)?.label}`,
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Opção 1'] : undefined,
    };

    setFields([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const duplicateField = (fieldId: string) => {
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (!fieldToDuplicate) return;

    const duplicated: FormField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      label: `${fieldToDuplicate.label} (Cópia)`,
    };

    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    const newFields = [...fields];
    newFields.splice(fieldIndex + 1, 0, duplicated);
    setFields(newFields);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newFields = Array.from(fields);
    const [reorderedField] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, reorderedField);

    setFields(newFields);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    updateField(fieldId, {
      options: [...field.options, `Opção ${field.options.length + 1}`]
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options || field.options.length <= 1) return;

    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    updateField(fieldId, { options: newOptions });
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, digite um nome para o formulário');
      return;
    }
    if (fields.length === 0) {
      alert('Adicione pelo menos um campo ao formulário');
      return;
    }
    onSave(name, description, fields);
  };

  return (
    <div className="space-y-6">
      {/* Form Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="form-name">Nome do Formulário *</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Avaliação Inicial"
            />
          </div>
          <div>
            <Label htmlFor="form-description">Descrição</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do formulário..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Field Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Campos</CardTitle>
          <CardDescription>Clique em um tipo de campo para adicionar ao formulário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fieldTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                size="sm"
                onClick={() => addField(type.value as FormField['type'])}
                className="justify-start"
              >
                <Plus className="h-3 w-3 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fields Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Campos do Formulário ({fields.length})</CardTitle>
          <CardDescription>Arraste para reordenar, clique para editar</CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                            </div>
                            <Badge variant="secondary">
                              {fieldTypes.find(t => t.value === field.type)?.label}
                            </Badge>
                            <span className="font-medium flex-1">{field.label}</span>
                            {field.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateField(field.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {editingField === field.id && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded border-t">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Rótulo do Campo</Label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={field.placeholder || ''}
                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${field.id}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                                />
                                <Label htmlFor={`required-${field.id}`}>Campo obrigatório</Label>
                              </div>

                              {['select', 'radio', 'checkbox'].includes(field.type) && (
                                <div>
                                  <Label>Opções</Label>
                                  <div className="space-y-2">
                                    {field.options?.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex gap-2">
                                        <Input
                                          value={option}
                                          onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                          placeholder={`Opção ${optionIndex + 1}`}
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeOption(field.id, optionIndex)}
                                          disabled={field.options!.length <= 1}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addOption(field.id)}
                                      className="w-full"
                                    >
                                      <Plus className="h-3 w-3 mr-2" />
                                      Adicionar Opção
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {fields.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Nenhum campo adicionado ainda. Use os botões acima para adicionar campos.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!name || fields.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Formulário
        </Button>
        <Button variant="outline" onClick={() => onPreview(fields)} disabled={fields.length === 0}>
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </div>
    </div>
  );
};
