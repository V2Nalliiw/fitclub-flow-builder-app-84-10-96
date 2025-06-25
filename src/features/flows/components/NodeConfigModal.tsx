
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
import { Plus, Trash2, Save } from 'lucide-react';
import { Node } from '@xyflow/react';

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
  const [config, setConfig] = useState<Record<string, any>>({});
  const [opcoes, setOpcoes] = useState<string[]>([]);

  useEffect(() => {
    if (node) {
      setConfig(node.data || {});
      setOpcoes((node.data?.opcoes as string[]) || []);
    }
  }, [node]);

  const handleSave = () => {
    const finalConfig = {
      ...config,
      opcoes: node?.type === 'question' ? opcoes : undefined,
    };
    onSave(finalConfig);
    onClose();
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

  if (!node) return null;

  const renderNodeConfig = () => {
    switch (node.type) {
      case 'start':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este nó inicia automaticamente a execução do fluxo. Não possui configurações adicionais.
            </p>
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
                <CardTitle className="text-sm text-blue-800">Ação Automática</CardTitle>
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

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configurar {String(node.data?.label || '')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderNodeConfig()}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#5D8701] hover:bg-[#4a6e01]">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
