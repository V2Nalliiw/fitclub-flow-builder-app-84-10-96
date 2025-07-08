import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, MessageSquare, Eye, Copy } from 'lucide-react';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { WhatsAppTemplate } from '@/types/whatsapp-template';
import { useToast } from '@/hooks/use-toast';

interface TemplateFormData {
  name: string;
  content: string;
  is_active: boolean;
  placeholders: string[];
}

export const WhatsAppTemplateManager = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useWhatsAppTemplates();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    content: '',
    is_active: true,
    placeholders: []
  });

  const extractPlaceholders = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.slice(1, -1)))];
  };

  const handleContentChange = (content: string) => {
    const placeholders = extractPlaceholders(content);
    setFormData(prev => ({ ...prev, content, placeholders }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        setEditingTemplate(null);
      } else {
        await createTemplate({
          ...formData,
          is_official: false
        });
        setIsCreateDialogOpen(false);
      }
      
      // Reset form
      setFormData({
        name: '',
        content: '',
        is_active: true,
        placeholders: []
      });
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setFormData({
      name: template.name,
      content: template.content,
      is_active: template.is_active,
      placeholders: template.placeholders
    });
    setEditingTemplate(template);
  };

  const handleDelete = async (template: WhatsAppTemplate) => {
    try {
      await deleteTemplate(template.id);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleCopyTemplate = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Template copiado",
        description: "O conteúdo do template foi copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template",
        variant: "destructive",
      });
    }
  };

  const getPreviewContent = (template: WhatsAppTemplate): string => {
    let content = template.content;
    
    // Substituir placeholders por valores de exemplo
    const exampleValues: Record<string, string> = {
      'code': '123456',
      'clinic_name': 'Clínica Exemplo',
      'expiry_time': '5 minutos',
      'form_name': 'Formulário de Avaliação',
      'patient_name': 'João Silva',
      'form_url': 'https://exemplo.com/form/123',
      'message': 'Esta é uma mensagem de exemplo'
    };

    template.placeholders.forEach(placeholder => {
      const value = exampleValues[placeholder] || `[${placeholder}]`;
      content = content.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    });

    return content;
  };

  const globalTemplates = templates.filter(t => !t.clinic_id);
  const clinicTemplates = templates.filter(t => t.clinic_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates de WhatsApp</h2>
          <p className="text-muted-foreground">
            Gerencie os templates de mensagens para envio via WhatsApp
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <form onSubmit={handleSubmit} className="space-y-4 p-1">
                <div>
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: codigo_verificacao"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo do Template</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Digite o conteúdo do template. Use {variavel} para placeholders."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use chaves para criar variáveis: &#123;code&#125;, &#123;clinic_name&#125;, etc.
                  </p>
                </div>

                {formData.placeholders.length > 0 && (
                  <div>
                    <Label>Variáveis Detectadas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.placeholders.map(placeholder => (
                        <Badge key={placeholder} variant="secondary">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Template ativo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Criar Template
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Globais */}
      {globalTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Templates Globais
            </CardTitle>
            <CardDescription>
              Templates padrão disponíveis para todas as clínicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {globalTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {template.is_official && (
                        <Badge variant="outline">Oficial</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyTemplate(template.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {template.content.replace(/\{[^}]+\}/g, '[var]')}
                  </p>
                  
                  {template.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.placeholders.map(placeholder => (
                        <Badge key={placeholder} variant="outline" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates da Clínica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Meus Templates
          </CardTitle>
          <CardDescription>
            Templates personalizados da sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinicTemplates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum template personalizado</h3>
              <p className="text-muted-foreground mb-4">
                Crie templates personalizados para sua clínica
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {clinicTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyTemplate(template.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o template "{template.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(template)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {template.content.replace(/\{[^}]+\}/g, '[var]')}
                  </p>
                  
                  {template.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.placeholders.map(placeholder => (
                        <Badge key={placeholder} variant="outline" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Preview */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome:</Label>
                <p className="text-sm">{previewTemplate.name}</p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Preview com dados de exemplo:</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg whitespace-pre-line text-sm">
                  {getPreviewContent(previewTemplate)}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-4 p-1">
              <div>
                <Label htmlFor="edit-name">Nome do Template</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-content">Conteúdo do Template</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={8}
                  required
                />
              </div>

              {formData.placeholders.length > 0 && (
                <div>
                  <Label>Variáveis Detectadas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.placeholders.map(placeholder => (
                      <Badge key={placeholder} variant="secondary">
                        {placeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-is_active">Template ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};