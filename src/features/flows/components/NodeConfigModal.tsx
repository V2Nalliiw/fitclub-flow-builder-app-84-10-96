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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, ExternalLink, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useFormManager } from '@/features/forms/hooks/useFormManager';
import { useFormIntegration } from '../hooks/useFormIntegration';
import { toast } from '@/hooks/use-toast';
import { WhatsAppNodeConfig } from './WhatsAppNodeConfig';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
  onSave: (nodeData: Partial<Node['data']>) => void;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  isOpen,
  onClose,
  node,
  onSave,
}) => {
  const { forms } = useFormManager();
  const { getFormById, generateFormUrl, updateFormNodeData, validateFormNode } = useFormIntegration();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (node) {
      setConfig(node.data || {});
      setOpcoes((node.data?.opcoes as string[]) || []);
    }
  }, [node]);

  const handleSave = async () => {
    if (!node) return;

    setIsLoading(true);
    
    try {
      let finalConfig = {
        ...config,
        opcoes: node?.type === 'question' ? opcoes : undefined,
      };

      // Validação específica para nós de formulário
      if (node.type === 'formSelect' && config.formId) {
        const errors = validateFormNode(config);
        if (errors.length > 0) {
          toast({
            title: "Erro na configuração",
            description: errors.join(', '),
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(finalConfig);
      onClose();
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addOpcao = () => {
    setOpcoes([...opcoes, '']);
  };

  const updateOpcao = (index: number, value: string) => {
    const newOpcoes = [...opcoes];
    newOpcoes[index] = value;
    setOpcoes(newOpcoes);
  };

  const removeOpcao = (index: number) => {
    setOpcoes(opcoes.filter((_, i) => i !== index));
  };

  const handleFormSelect = (formId: string) => {
    const form = getFormById(formId);
    if (form) {
      const updatedData = updateFormNodeData(node!, formId);
      setConfig({ ...config, ...updatedData });
      
      toast({
        title: "Formulário selecionado",
        description: `Formulário "${form.name}" foi configurado com sucesso.`,
      });
    }
  };

  const handlePreviewForm = () => {
    if (config.formId) {
      const url = generateFormUrl(config.formId);
      window.open(url, '_blank');
    }
  };

  if (!node) return null;

  const renderNodeConfig = () => {
    switch (node.type) {
      case 'start':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Nó Inicial</p>
                <p className="text-xs text-blue-600">
                  Este nó inicia automaticamente a execução do fluxo. Não possui configurações adicionais.
                </p>
              </div>
            </div>
          </div>
        );

      case 'end':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mensagemFinal">Mensagem Final (Opcional)</Label>
              <Textarea
                id="mensagemFinal"
                value={String(config.mensagemFinal || '')}
                onChange={(e) => setConfig({ ...config, mensagemFinal: e.target.value })}
                placeholder="Mensagem de encerramento do fluxo..."
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'formStart':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título do Formulário *</Label>
              <Input
                id="titulo"
                value={String(config.titulo || '')}
                onChange={(e) => setConfig({ ...config, titulo: e.target.value })}
                placeholder="Ex: Formulário do Dia 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={String(config.descricao || '')}
                onChange={(e) => setConfig({ ...config, descricao: e.target.value })}
                placeholder="Introdução ou instruções para o paciente..."
                className="mt-1"
              />
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ação Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-blue-700">
                  Ao atingir este nó, será enviada automaticamente uma mensagem no WhatsApp com o link do formulário.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'formEnd':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mensagemFinal">Mensagem de Conclusão</Label>
              <Textarea
                id="mensagemFinal"
                value={String(config.mensagemFinal || '')}
                onChange={(e) => setConfig({ ...config, mensagemFinal: e.target.value })}
                placeholder="Obrigado por responder o formulário!"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tipoConteudo">Tipo de Conteúdo</Label>
              <Select
                value={String(config.tipoConteudo || '')}
                onValueChange={(value) => setConfig({ ...config, tipoConteudo: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de conteúdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="imagem">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="ebook">E-book</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="arquivo">Upload de Arquivo</Label>
              <Input
                id="arquivo"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setConfig({ ...config, arquivo: file.name });
                  }
                }}
                className="mt-1"
              />
              {config.arquivo && (
                <p className="text-xs text-muted-foreground mt-1">
                  Arquivo atual: {String(config.arquivo)}
                </p>
              )}
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipoIntervalo">Tipo de Intervalo</Label>
              <Select
                value={String(config.tipoIntervalo || '')}
                onValueChange={(value) => setConfig({ ...config, tipoIntervalo: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutos">Minutos</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                  <SelectItem value="dias">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={String(config.quantidade || '')}
                onChange={(e) => setConfig({ ...config, quantidade: parseInt(e.target.value) || 1 })}
                placeholder="1"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'question':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pergunta">Texto da Pergunta *</Label>
              <Textarea
                id="pergunta"
                value={String(config.pergunta || '')}
                onChange={(e) => setConfig({ ...config, pergunta: e.target.value })}
                placeholder="Digite sua pergunta aqui..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tipoResposta">Tipo de Resposta</Label>
              <Select
                value={String(config.tipoResposta || '')}
                onValueChange={(value) => setConfig({ ...config, tipoResposta: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="escolha-unica">Escolha Única</SelectItem>
                  <SelectItem value="multipla-escolha">Múltipla Escolha</SelectItem>
                  <SelectItem value="texto-livre">Texto Livre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(config.tipoResposta === 'escolha-unica' || config.tipoResposta === 'multipla-escolha') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opções de Resposta</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOpcao}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {opcoes.map((opcao, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={opcao}
                        onChange={(e) => updateOpcao(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOpcao(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'formSelect':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="formId">Selecionar Formulário *</Label>
              <Select
                value={String(config.formId || '')}
                onValueChange={handleFormSelect}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Escolha um formulário salvo" />
                </SelectTrigger>
                <SelectContent>
                  {forms.filter(form => form.status === 'active').map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      <div className="flex flex-col">
                        <span>{form.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {form.fields.length} campos • {form.responses} respostas
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {forms.filter(form => form.status === 'active').length === 0 && (
                <div className="flex items-center gap-2 mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="text-xs text-orange-700">
                    Nenhum formulário ativo disponível. Crie um formulário primeiro.
                  </p>
                </div>
              )}
            </div>
            
            {config.formId && (
              <>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewForm}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visualizar Formulário
                  </Button>
                </div>

                <WhatsAppNodeConfig
                  config={config}
                  setConfig={setConfig}
                  formName={config.formName}
                  formId={config.formId}
                />
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configurar {String(node?.data?.label || '')}
            {node?.type === 'formSelect' && config.formId && (
              <Badge variant="secondary" className="text-xs">
                Formulário Selecionado
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderNodeConfig()}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-[#5D8701] hover:bg-[#4a6e01]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
