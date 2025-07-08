
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check, FileText, Clock, Calculator, GitBranch } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface FlowPreviewProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowPreview: React.FC<FlowPreviewProps> = ({ nodes, edges }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [calculatorResults, setCalculatorResults] = useState<Record<string, number>>({});
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
    
    // Para perguntas de escolha única, usa o handle específico
    if (currentNode?.type === 'question' && currentNode.data.tipoResposta === 'escolha-unica' && selectedOption) {
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

      // Se é resultado de calculadora, salva também no calculatorResults
      if (currentNode.type === 'calculator' && typeof value === 'number') {
        setCalculatorResults(prev => ({
          ...prev,
          [currentNodeId]: value
        }));
      }
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
    setCalculatorResults({});
    setIsCompleted(false);
  };

  const renderCalculatorNode = (node: Node) => {
    const { data } = node;
    const [fieldValues, setFieldValues] = useState<Record<string, number>>({});

    const handleFieldChange = (fieldId: string, value: number) => {
      setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const calculateResult = () => {
      try {
        const fields = Array.isArray(data?.calculatorFields) ? data.calculatorFields : [];
        let formula = String(data?.formula || '');
        
        // Substitui as nomenclaturas pelos valores
        fields.forEach((field: any) => {
          const value = fieldValues[field.id] || 0;
          formula = formula.replace(new RegExp(field.nomenclatura, 'g'), value.toString());
        });
        
        // Calcula o resultado
        const result = eval(formula);
        handleNext(result);
      } catch (error) {
        console.error('Erro no cálculo:', error);
        handleNext(0);
      }
    };

    const canCalculate = () => {
      const fields = Array.isArray(data?.calculatorFields) ? data.calculatorFields : [];
      return fields.every((field: any) => fieldValues[field.id] !== undefined);
    };

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{String(data?.label || 'Calculadora')}</CardTitle>
          {data?.resultLabel && (
            <p className="text-muted-foreground">{String(data.resultLabel)}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(data?.calculatorFields) && data.calculatorFields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.pergunta}
              </Label>
              <div className="flex items-center space-x-2">
                {field.prefixo && <span className="text-sm text-muted-foreground">{field.prefixo}</span>}
                <Input
                  id={field.id}
                  type="number"
                  step={field.tipo === 'decimal' ? '0.01' : '1'}
                  value={fieldValues[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                {field.sufixo && <span className="text-sm text-muted-foreground">{field.sufixo}</span>}
              </div>
            </div>
          ))}
          
          <Button 
            onClick={calculateResult}
            disabled={!canCalculate()}
            className="w-full mt-4"
          >
            Calcular
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderConditionsNode = (node: Node) => {
    const { data } = node;
    
    // Pega o resultado mais recente da calculadora
    const calculatorResult = Object.values(calculatorResults).pop() || 0;
    
    const evaluateConditions = (result: number, conditions: any[]) => {
      for (const condition of conditions) {
        const fieldValue = result;
        
        switch (condition.operador) {
          case 'igual':
            if (fieldValue === condition.valor) return condition;
            break;
          case 'maior':
            if (fieldValue > condition.valor) return condition;
            break;
          case 'menor':
            if (fieldValue < condition.valor) return condition;
            break;
          case 'maior_igual':
            if (fieldValue >= condition.valor) return condition;
            break;
          case 'menor_igual':
            if (fieldValue <= condition.valor) return condition;
            break;
          case 'diferente':
            if (fieldValue !== condition.valor) return condition;
            break;
          case 'entre':
            if (fieldValue >= condition.valor && fieldValue <= (condition.valorFinal || 0)) return condition;
            break;
        }
      }
      return null;
    };

    const conditions = Array.isArray(data?.conditions) ? data.conditions : [];
    const matchedCondition = evaluateConditions(calculatorResult, conditions);

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{String(data?.label || 'Avaliação de Condições')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Resultado: {calculatorResult.toFixed(2)}
            </div>
          </div>

          <div className="space-y-3">
            {conditions.map((condition: any, index: number) => {
              const isMatched = matchedCondition?.id === condition.id;
              
              return (
                <div
                  key={condition.id || index}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isMatched 
                      ? 'border-primary bg-primary/10 dark:bg-primary/5' 
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {condition.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {condition.operador === 'entre' 
                          ? `${condition.campo} entre ${condition.valor} e ${condition.valorFinal}`
                          : `${condition.campo} ${condition.operador} ${condition.valor}`
                        }
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isMatched
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isMatched ? '✓ Atendida' : 'Não atendida'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {matchedCondition && (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">
                Resultado da Avaliação:
              </h4>
              <p className="text-primary">
                {matchedCondition.label}
              </p>
            </div>
          )}

          <Button onClick={() => handleNext(matchedCondition)} className="w-full mt-4">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderNode = (node: Node) => {
    const { data } = node;

    switch (node.type) {
      case 'calculator':
        return renderCalculatorNode(node);

      case 'conditions':
        return renderConditionsNode(node);

      case 'formStart':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
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
                <div className="space-y-2">
                  {data.opcoes.map((opcao: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox id={`multi-option-${index}`} />
                      <Label htmlFor={`multi-option-${index}`}>{opcao}</Label>
                    </div>
                  ))}
                  <Button 
                    onClick={() => {
                      const selectedOptions: string[] = [];
                      if (Array.isArray(data.opcoes)) {
                        data.opcoes.forEach((opcao: string, index: number) => {
                          const checkbox = document.getElementById(`multi-option-${index}`) as HTMLInputElement;
                          if (checkbox?.checked) {
                            selectedOptions.push(opcao);
                          }
                        });
                      }
                      handleNext(selectedOptions);
                    }}
                    className="w-full mt-4"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
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
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                        {String(node?.data?.pergunta || node?.data?.label || `Nó ${nodeId}`)}
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
