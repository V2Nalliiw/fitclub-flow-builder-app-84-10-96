
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check, FileText, Clock } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface FlowPreviewProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowPreview: React.FC<FlowPreviewProps> = ({ nodes, edges }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Encontra o nó inicial
  useEffect(() => {
    const startNode = nodes.find(node => node.type === 'start');
    if (startNode) {
      // Encontra o próximo nó conectado ao start
      const nextEdge = edges.find(edge => edge.source === startNode.id);
      if (nextEdge) {
        setCurrentNodeId(nextEdge.target);
      }
    }
  }, [nodes, edges]);

  const getCurrentNode = () => {
    return nodes.find(node => node.id === currentNodeId);
  };

  const getNextNode = (currentId: string, selectedOption?: string) => {
    const currentNode = nodes.find(node => node.id === currentId);
    
    // Para perguntas de múltipla escolha, usa o handle específico
    if (currentNode?.type === 'question' && currentNode.data.tipoResposta === 'multipla-escolha' && selectedOption) {
      const opcoes = Array.isArray(currentNode.data.opcoes) ? currentNode.data.opcoes : [];
      const optionIndex = opcoes.indexOf(selectedOption);
      const nextEdge = edges.find(edge => 
        edge.source === currentId && edge.sourceHandle === `opcao-${optionIndex}`
      );
      return nextEdge ? nodes.find(node => node.id === nextEdge.target) : null;
    }
    
    // Para outros tipos, usa a conexão padrão
    const nextEdge = edges.find(edge => edge.source === currentId);
    return nextEdge ? nodes.find(node => node.id === nextEdge.target) : null;
  };

  const handleNext = (value?: any) => {
    const currentNode = getCurrentNode();
    if (!currentNode) return;

    // Salva a resposta
    if (value !== undefined) {
      setResponses(prev => ({
        ...prev,
        [currentNodeId]: value
      }));
    }

    // Encontra o próximo nó
    const nextNode = getNextNode(currentNodeId, value);
    
    if (nextNode) {
      if (nextNode.type === 'end') {
        setIsCompleted(true);
      } else {
        setCurrentNodeId(nextNode.id);
      }
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    const startNode = nodes.find(node => node.type === 'start');
    if (startNode) {
      const nextEdge = edges.find(edge => edge.source === startNode.id);
      if (nextEdge) {
        setCurrentNodeId(nextEdge.target);
      }
    }
    setResponses({});
    setIsCompleted(false);
  };

  const renderNode = (node: Node) => {
    const { data } = node;

    switch (node.type) {
      case 'formStart':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{String(data?.titulo || 'Formulário')}</CardTitle>
              {data?.descricao && (
                <p className="text-muted-foreground">{String(data.descricao)}</p>
              )}
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleNext()} className="w-full">
                Começar Formulário
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'question':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">{String(data?.pergunta || 'Pergunta')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.tipoResposta === 'escolha-unica' && Array.isArray(data.opcoes) && (
                <RadioGroup onValueChange={(value) => handleNext(value)}>
                  {data.opcoes.map((opcao: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={opcao} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{opcao}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {data?.tipoResposta === 'multipla-escolha' && Array.isArray(data.opcoes) && (
                <div className="space-y-3">
                  {data.opcoes.map((opcao: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleNext(opcao)}
                    >
                      {opcao}
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}

              {data?.tipoResposta === 'texto-livre' && (
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Digite sua resposta..."
                    id="text-response"
                  />
                  <Button 
                    onClick={() => {
                      const textarea = document.getElementById('text-response') as HTMLTextAreaElement;
                      handleNext(textarea?.value || '');
                    }}
                    className="w-full"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'delay':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Aguardando...</CardTitle>
              <p className="text-muted-foreground">
                Aguarde {String(data?.quantidade || '1')} {String(data?.tipoIntervalo || 'minutos')} para continuar
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleNext()} variant="outline" className="w-full">
                Simular Continuação
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'formEnd':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Conteúdo Disponível</CardTitle>
              {data?.mensagemFinal && (
                <p className="text-muted-foreground">{String(data.mensagemFinal)}</p>
              )}
            </CardHeader>
            <CardContent className="text-center">
              {data?.arquivo && (
                <div className="p-4 border rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">Arquivo: {String(data?.tipoConteudo || 'Arquivo')}</p>
                  <p className="font-medium">{String(data.arquivo)}</p>
                </div>
              )}
              <Button onClick={() => handleNext()} className="w-full">
                Download Conteúdo
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <p>Nó não configurado: {node.type}</p>
              <Button onClick={() => handleNext()} className="w-full mt-4">
                Continuar
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum nó encontrado no fluxo</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Formulário Concluído!</CardTitle>
            <p className="text-muted-foreground">
              Todas as etapas foram finalizadas com sucesso.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReset} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Testar Novamente
            </Button>
          </CardContent>
        </Card>

        {Object.keys(responses).length > 0 && (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Respostas Coletadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(responses).map(([nodeId, response]) => {
                  const node = nodes.find(n => n.id === nodeId);
                  return (
                    <div key={nodeId} className="p-2 bg-muted rounded">
                      <p className="text-sm font-medium">
                        {String(node?.data?.pergunta || `Nó ${nodeId}`)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {typeof response === 'string' ? response : JSON.stringify(response)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const currentNode = getCurrentNode();
  if (!currentNode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Fluxo não está conectado corretamente</p>
          <Button onClick={handleReset} variant="outline">
            Reiniciar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderNode(currentNode)}
      
      <div className="flex justify-center">
        <Button onClick={handleReset} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Reiniciar Teste
        </Button>
      </div>
    </div>
  );
};
