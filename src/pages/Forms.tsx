
import React, { useState } from 'react';
import { DynamicForm } from '@/features/forms/components/DynamicForm';
import { FormBuilder } from '@/features/forms/components/FormBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, Edit, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFormManager, SavedForm, FormField } from '@/features/forms/hooks/useFormManager';

export const Forms = () => {
  const { toast } = useToast();
  const { forms, saveForm, updateForm, deleteForm, duplicateForm } = useFormManager();
  
  const [activeTab, setActiveTab] = useState('list');
  const [selectedForm, setSelectedForm] = useState<SavedForm | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<SavedForm | null>(null);
  const [previewFields, setPreviewFields] = useState<FormField[]>([]);

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    toast({
      title: "Formulário enviado",
      description: "Os dados foram registrados com sucesso.",
    });
  };

  const handleCreateNew = () => {
    setEditingForm(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (form: SavedForm) => {
    setEditingForm(form);
    setIsBuilderOpen(true);
  };

  const handleSaveForm = (name: string, description: string, fields: FormField[]) => {
    if (editingForm) {
      updateForm(editingForm.id, { name, description, fields });
    } else {
      saveForm({ name, description, fields, status: 'active' });
    }
    setIsBuilderOpen(false);
    setEditingForm(null);
  };

  const handlePreview = (fields: FormField[]) => {
    setPreviewFields(fields);
    setIsPreviewOpen(true);
  };

  const handlePreviewForm = (form: SavedForm) => {
    setPreviewFields(form.fields);
    setIsPreviewOpen(true);
  };

  const handleDelete = (formId: string) => {
    if (confirm('Tem certeza que deseja excluir este formulário?')) {
      deleteForm(formId);
    }
  };

  const handleDuplicate = (formId: string) => {
    duplicateForm(formId);
  };

  const toggleStatus = (form: SavedForm) => {
    updateForm(form.id, { 
      status: form.status === 'active' ? 'inactive' : 'active' 
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formulários Dinâmicos</h1>
          <p className="text-muted-foreground">Crie e gerencie formulários personalizados</p>
        </div>
        
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Formulários</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                        {form.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handlePreviewForm(form)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(form)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(form.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(form)}>
                            {form.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(form.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {form.description && (
                    <CardDescription>{form.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>{form.fields.length} campos</span>
                    <span>{form.responses} respostas</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreviewForm(form)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(form)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {forms.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    Nenhum formulário criado ainda
                  </div>
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Formulário
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {selectedForm ? (
            <DynamicForm
              formId={selectedForm.id}
              title={selectedForm.name}
              description={selectedForm.description}
              fields={selectedForm.fields}
              onSubmit={handleFormSubmit}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  Selecione um formulário da lista para visualizar
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Editar Formulário' : 'Criar Novo Formulário'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            initialFields={editingForm?.fields}
            formName={editingForm?.name}
            formDescription={editingForm?.description}
            onSave={handleSaveForm}
            onPreview={handlePreview}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Formulário</DialogTitle>
          </DialogHeader>
          {previewFields.length > 0 && (
            <DynamicForm
              formId="preview"
              title="Preview"
              description="Esta é uma visualização do formulário"
              fields={previewFields}
              onSubmit={handleFormSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
