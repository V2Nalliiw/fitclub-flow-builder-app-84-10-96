
import React, { useState } from 'react';
import { DynamicForm } from '@/features/forms/components/DynamicForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockFormFields = [
  {
    id: 'name',
    type: 'text' as const,
    label: 'Nome Completo',
    placeholder: 'Digite seu nome',
    required: true
  },
  {
    id: 'email',
    type: 'email' as const,
    label: 'Email',
    placeholder: 'seu@email.com',
    required: true
  },
  {
    id: 'pain_level',
    type: 'select' as const,
    label: 'Nível de Dor (0-10)',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    required: true
  },
  {
    id: 'symptoms',
    type: 'checkbox' as const,
    label: 'Sintomas',
    options: ['Dor nas costas', 'Dor no pescoço', 'Dor nos ombros', 'Dor nas pernas'],
    required: false
  },
  {
    id: 'additional_info',
    type: 'textarea' as const,
    label: 'Informações Adicionais',
    placeholder: 'Descreva outros sintomas ou observações...',
    required: false
  }
];

const mockForms = [
  {
    id: '1',
    name: 'Avaliação Inicial',
    description: 'Formulário para primeira consulta',
    fields: mockFormFields,
    responses: 23,
    status: 'active'
  },
  {
    id: '2',
    name: 'Feedback Semanal',
    description: 'Acompanhamento semanal do paciente',
    fields: mockFormFields.slice(0, 3),
    responses: 45,
    status: 'active'
  }
];

export const Forms = () => {
  const { toast } = useToast();
  const [selectedForm, setSelectedForm] = useState(mockForms[0]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    toast({
      title: "Formulário enviado",
      description: "Os dados foram registrados com sucesso.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formulários Dinâmicos</h1>
          <p className="text-muted-foreground">Crie e gerencie formulários baseados nos fluxos</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de formulários */}
        <Card>
          <CardHeader>
            <CardTitle>Formulários</CardTitle>
            <CardDescription>
              Selecione um formulário para visualizar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockForms.map((form) => (
              <div
                key={form.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedForm.id === form.id ? 'border-primary bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedForm(form)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{form.name}</h4>
                  <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                    {form.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{form.fields.length} campos</span>
                  <span>{form.responses} respostas</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview do formulário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedForm.name}</CardTitle>
                  <CardDescription>{selectedForm.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DynamicForm
                formId={selectedForm.id}
                title={selectedForm.name}
                description={selectedForm.description}
                fields={selectedForm.fields}
                onSubmit={handleFormSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
