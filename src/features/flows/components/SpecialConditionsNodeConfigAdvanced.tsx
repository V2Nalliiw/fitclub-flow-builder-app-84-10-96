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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, Trash2, Info, GitBranch, Calculator, Hash, HelpCircle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdvancedSpecialCondition {
  id: string;
  name: string;
  description?: string;
  
  // Fontes de dados disponíveis no fluxo
  dataSources: {
    numericFields: string[];     // ['peso', 'altura', 'idade']
    questionResponses: string[]; // ['pergunta_1', 'pergunta_2']
    calculationResults: string[]; // ['imc', 'calculo_dose']
  };
  
  // Estrutura da expressão lógica
  expression: {
    type: 'simple' | 'complex';
    rules: ConditionRule[];
    logic: 'AND' | 'OR';
  };
  
  // Ações baseadas no resultado
  outcomes: {
    true: { nextNode?: string; message?: string };
    false: { nextNode?: string; message?: string };
  };
  
  label: string;
}

interface ConditionRule {
  id: string;
  source: {
    type: 'numeric' | 'question' | 'calculation' | 'combined';
    field: string;
    aggregation?: 'sum' | 'average' | 'max' | 'min' | 'count';
  };
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'contains' | 'in';
  value: any;
  valueEnd?: any;
}

interface SpecialConditionsNodeConfigAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const SpecialConditionsNodeConfigAdvanced: React.FC<SpecialConditionsNodeConfigAdvancedProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [conditions, setConditions] = useState<AdvancedSpecialCondition[]>([]);
  const [selectedTab, setSelectedTab] = useState('data-sources');

  useEffect(() => {
    if (initialData?.condicoesEspeciais) {
      // Migrar dados antigos para novo formato se necessário
      const migratedConditions = initialData.condicoesEspeciais.map((old: any) => ({
        id: old.id || Date.now().toString(),
        name: old.label || 'Condição sem nome',
        description: '',
        dataSources: {
          numericFields: old.tipos?.includes('numerico') ? [old.campo || ''] : [],
          questionResponses: old.tipos?.includes('pergunta') ? [old.campo || ''] : [],
          calculationResults: old.tipos?.includes('calculo') ? [old.campo || ''] : [],
        },
        expression: {
          type: 'simple' as const,
          rules: [{
            id: `rule-${Date.now()}`,
            source: {
              type: old.tipos?.[0] || 'numeric',
              field: old.campo || '',
              aggregation: undefined,
            },
            operator: old.operador === 'igual' ? 'eq' : 
                     old.operador === 'maior' ? 'gt' :
                     old.operador === 'menor' ? 'lt' : 'eq',
            value: old.valor,
            valueEnd: old.valorFinal,
          }],
          logic: 'AND' as const,
        },
        outcomes: {
          true: { message: 'Condição atendida' },
          false: { message: 'Condição não atendida' },
        },
        label: old.label || 'Condição',
      }));
      setConditions(migratedConditions);
    }
  }, [initialData]);

  const operatorLabels = {
    'eq': 'Igual a (=)',
    'ne': 'Diferente de (≠)',
    'gt': 'Maior que (>)',
    'lt': 'Menor que (<)',
    'gte': 'Maior ou igual (≥)',
    'lte': 'Menor ou igual (≤)',
    'between': 'Entre X e Y',
    'contains': 'Contém',
    'in': 'Está em (lista)',
  };

  const aggregationLabels = {
    'sum': 'Soma',
    'average': 'Média',
    'max': 'Máximo',
    'min': 'Mínimo',
    'count': 'Contagem',
  };

  const addCondition = () => {
    const newCondition: AdvancedSpecialCondition = {
      id: Date.now().toString(),
      name: 'Nova Condição',
      description: '',
      dataSources: {
        numericFields: [],
        questionResponses: [],
        calculationResults: [],
      },
      expression: {
        type: 'simple',
        rules: [],
        logic: 'AND',
      },
      outcomes: {
        true: { message: '' },
        false: { message: '' },
      },
      label: 'Nova Condição',
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<AdvancedSpecialCondition>) => {
    setConditions(conditions.map(cond => 
      cond.id === id ? { ...cond, ...updates } : cond
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(cond => cond.id !== id));
  };

  const addRule = (conditionId: string) => {
    const newRule: ConditionRule = {
      id: `rule-${Date.now()}`,
      source: {
        type: 'numeric',
        field: '',
      },
      operator: 'gt',
      value: '',
    };

    updateCondition(conditionId, {
      expression: {
        ...conditions.find(c => c.id === conditionId)!.expression,
        rules: [...conditions.find(c => c.id === conditionId)!.expression.rules, newRule],
      },
    });
  };

  const updateRule = (conditionId: string, ruleId: string, updates: Partial<ConditionRule>) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const updatedRules = condition.expression.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );

    updateCondition(conditionId, {
      expression: {
        ...condition.expression,
        rules: updatedRules,
      },
    });
  };

  const removeRule = (conditionId: string, ruleId: string) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const updatedRules = condition.expression.rules.filter(rule => rule.id !== ruleId);

    updateCondition(conditionId, {
      expression: {
        ...condition.expression,
        rules: updatedRules,
      },
    });
  };

  const addDataSource = (conditionId: string, type: string, field: string) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const updatedDataSources = { ...condition.dataSources };
    if (type === 'numeric') {
      updatedDataSources.numericFields = [...updatedDataSources.numericFields, field];
    } else if (type === 'question') {
      updatedDataSources.questionResponses = [...updatedDataSources.questionResponses, field];
    } else if (type === 'calculation') {
      updatedDataSources.calculationResults = [...updatedDataSources.calculationResults, field];
    }

    updateCondition(conditionId, { dataSources: updatedDataSources });
  };

  const getPreviewText = (condition: AdvancedSpecialCondition) => {
    if (condition.expression.rules.length === 0) {
      return 'Nenhuma regra configurada';
    }

    const ruleTexts = condition.expression.rules.map(rule => {
      const aggregation = rule.source.aggregation ? `${aggregationLabels[rule.source.aggregation]}(${rule.source.field})` : rule.source.field;
      const operator = operatorLabels[rule.operator];
      
      if (rule.operator === 'between') {
        return `${aggregation} ${operator} ${rule.value} e ${rule.valueEnd}`;
      }
      return `${aggregation} ${operator} ${rule.value}`;
    });

    return ruleTexts.join(` ${condition.expression.logic} `);
  };

  const handleSave = () => {
    // Converter para formato compatível com sistema antigo
    const compatibleData = conditions.map(condition => ({
      id: condition.id,
      label: condition.name,
      tipos: [
        ...(condition.dataSources.numericFields.length > 0 ? ['numerico'] : []),
        ...(condition.dataSources.questionResponses.length > 0 ? ['pergunta'] : []),
        ...(condition.dataSources.calculationResults.length > 0 ? ['calculo'] : []),
      ],
      // Manter compatibilidade com formato antigo
      campo: condition.expression.rules[0]?.source.field || '',
      operador: condition.expression.rules[0]?.operator || 'gt',
      valor: condition.expression.rules[0]?.value || '',
      valorFinal: condition.expression.rules[0]?.valueEnd,
      // Dados avançados
      _advanced: condition,
    }));

    onSave({ condicoesEspeciais: compatibleData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Configurar Condições Especiais Avançadas
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="data-sources" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Fontes de Dados
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Condições
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Ajuda
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="data-sources" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure aqui quais dados do seu fluxo você quer usar nas condições especiais.
                  Você pode combinar campos numéricos, respostas de perguntas e resultados de cálculos.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {conditions.length} condição(ões) configurada(s)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Condição
                </Button>
              </div>

              {conditions.map((condition) => (
                <Card key={condition.id} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <Input
                        value={condition.name}
                        onChange={(e) => updateCondition(condition.id, { 
                          name: e.target.value,
                          label: e.target.value 
                        })}
                        placeholder="Nome da condição"
                        className="text-sm font-medium border-none p-0 h-auto bg-transparent"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-800"
                      >
                        <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Descrição (opcional)</Label>
                      <Textarea
                        value={condition.description}
                        onChange={(e) => updateCondition(condition.id, { description: e.target.value })}
                        placeholder="Descreva o que esta condição faz..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Campos Numéricos</Label>
                        <div className="mt-2 space-y-2">
                          {condition.dataSources.numericFields.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={field}
                                onChange={(e) => {
                                  const updated = [...condition.dataSources.numericFields];
                                  updated[index] = e.target.value;
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      numericFields: updated,
                                    },
                                  });
                                }}
                                placeholder="peso, altura, idade..."
                                className="text-xs"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = condition.dataSources.numericFields.filter((_, i) => i !== index);
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      numericFields: updated,
                                    },
                                  });
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDataSource(condition.id, 'numeric', '')}
                            className="w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Campo
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Respostas de Perguntas</Label>
                        <div className="mt-2 space-y-2">
                          {condition.dataSources.questionResponses.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={field}
                                onChange={(e) => {
                                  const updated = [...condition.dataSources.questionResponses];
                                  updated[index] = e.target.value;
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      questionResponses: updated,
                                    },
                                  });
                                }}
                                placeholder="pergunta_1, sintomas..."
                                className="text-xs"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = condition.dataSources.questionResponses.filter((_, i) => i !== index);
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      questionResponses: updated,
                                    },
                                  });
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDataSource(condition.id, 'question', '')}
                            className="w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Pergunta
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Resultados de Cálculos</Label>
                        <div className="mt-2 space-y-2">
                          {condition.dataSources.calculationResults.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={field}
                                onChange={(e) => {
                                  const updated = [...condition.dataSources.calculationResults];
                                  updated[index] = e.target.value;
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      calculationResults: updated,
                                    },
                                  });
                                }}
                                placeholder="imc, dose_medicamento..."
                                className="text-xs"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = condition.dataSources.calculationResults.filter((_, i) => i !== index);
                                  updateCondition(condition.id, {
                                    dataSources: {
                                      ...condition.dataSources,
                                      calculationResults: updated,
                                    },
                                  });
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDataSource(condition.id, 'calculation', '')}
                            className="w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Cálculo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              {conditions.map((condition) => (
                <Card key={condition.id} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{condition.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Regras da Condição</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={condition.expression.logic}
                          onValueChange={(value: 'AND' | 'OR') => 
                            updateCondition(condition.id, {
                              expression: { ...condition.expression, logic: value }
                            })
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">E (AND)</SelectItem>
                            <SelectItem value="OR">OU (OR)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addRule(condition.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Regra
                        </Button>
                      </div>
                    </div>

                    {condition.expression.rules.map((rule, ruleIndex) => (
                      <Card key={rule.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-6 gap-2 items-end">
                            <div>
                              <Label className="text-xs">Tipo</Label>
                              <Select
                                value={rule.source.type}
                                onValueChange={(value: any) =>
                                  updateRule(condition.id, rule.id, {
                                    source: { ...rule.source, type: value }
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="numeric">Numérico</SelectItem>
                                  <SelectItem value="question">Pergunta</SelectItem>
                                  <SelectItem value="calculation">Cálculo</SelectItem>
                                  <SelectItem value="combined">Combinado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Campo</Label>
                              <Input
                                value={rule.source.field}
                                onChange={(e) =>
                                  updateRule(condition.id, rule.id, {
                                    source: { ...rule.source, field: e.target.value }
                                  })
                                }
                                placeholder="nome do campo"
                              />
                            </div>

                            {rule.source.type === 'combined' && (
                              <div>
                                <Label className="text-xs">Agregação</Label>
                                <Select
                                  value={rule.source.aggregation}
                                  onValueChange={(value: any) =>
                                    updateRule(condition.id, rule.id, {
                                      source: { ...rule.source, aggregation: value }
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Escolha" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(aggregationLabels).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div>
                              <Label className="text-xs">Operador</Label>
                              <Select
                                value={rule.operator}
                                onValueChange={(value: any) =>
                                  updateRule(condition.id, rule.id, { operator: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(operatorLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Valor</Label>
                              <Input
                                value={rule.value}
                                onChange={(e) =>
                                  updateRule(condition.id, rule.id, { value: e.target.value })
                                }
                                placeholder="valor"
                              />
                            </div>

                            <div className="flex gap-1">
                              {rule.operator === 'between' && (
                                <Input
                                  value={rule.valueEnd || ''}
                                  onChange={(e) =>
                                    updateRule(condition.id, rule.id, { valueEnd: e.target.value })
                                  }
                                  placeholder="valor final"
                                  className="w-20"
                                />
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRule(condition.id, rule.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Preview */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <Label className="text-xs font-medium text-muted-foreground">Preview da Condição:</Label>
                      <p className="text-sm mt-1 font-mono">{getPreviewText(condition)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div className="space-y-6">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Como usar o Sistema de Condições Especiais</strong>
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Fontes de Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium">Campos Numéricos:</h4>
                      <p className="text-sm text-muted-foreground">
                        Use para dados numéricos como peso, altura, idade, pressão arterial.
                        Exemplo: <code>peso</code>, <code>altura</code>, <code>idade</code>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Respostas de Perguntas:</h4>
                      <p className="text-sm text-muted-foreground">
                        Use para respostas de perguntas do fluxo.
                        Exemplo: <code>pergunta_sintomas</code>, <code>tem_diabetes</code>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Resultados de Cálculos:</h4>
                      <p className="text-sm text-muted-foreground">
                        Use para resultados de nós de cálculo.
                        Exemplo: <code>imc</code>, <code>dose_medicamento</code>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🔧 Configuração de Regras</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium">Operadores Disponíveis:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li><code>=</code> Igual a</li>
                        <li><code>{'>'}</code> Maior que</li>
                        <li><code>{'<'}</code> Menor que</li>
                        <li><code>≥</code> Maior ou igual</li>
                        <li><code>≤</code> Menor ou igual</li>
                        <li><code>≠</code> Diferente de</li>
                        <li><code>ENTRE</code> Entre dois valores</li>
                        <li><code>CONTÉM</code> Contém texto</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Agregações (Tipo Combinado):</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li><code>SOMA</code> - Soma múltiplos valores</li>
                        <li><code>MÉDIA</code> - Média de múltiplos valores</li>
                        <li><code>MAX</code> - Valor máximo</li>
                        <li><code>MIN</code> - Valor mínimo</li>
                        <li><code>CONTAGEM</code> - Quantidade de itens</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Exemplos Práticos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Exemplo 1: Soma Seletiva</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <p><strong>Objetivo:</strong> Paciente de risco elevado</p>
                        <p><strong>Regra:</strong> SOMA(peso, altura_cm) {'>'} 250 E idade {'>='} 65</p>
                        <p><strong>Como fazer:</strong></p>
                        <ol className="ml-4 space-y-1">
                          <li>1. Adicione campos numéricos: peso, altura_cm, idade</li>
                          <li>2. Crie regra 1: Tipo "Combinado", Campo "peso,altura_cm", Agregação "SOMA", Operador "{'>'}", Valor "250"</li>
                          <li>3. Crie regra 2: Tipo "Numérico", Campo "idade", Operador "{'>='}", Valor "65"</li>
                          <li>4. Defina lógica como "E (AND)"</li>
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Exemplo 2: Resposta Específica</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <p><strong>Objetivo:</strong> Tem sintomas graves</p>
                        <p><strong>Regra:</strong> pergunta_sintomas = "severo" OU pergunta_dor {'>='} 8</p>
                        <p><strong>Como fazer:</strong></p>
                        <ol className="ml-4 space-y-1">
                          <li>1. Adicione resposta de pergunta: pergunta_sintomas</li>
                          <li>2. Adicione campo numérico: pergunta_dor</li>
                          <li>3. Crie regra 1: Tipo "Pergunta", Campo "pergunta_sintomas", Operador "=", Valor "severo"</li>
                          <li>4. Crie regra 2: Tipo "Numérico", Campo "pergunta_dor", Operador "{'>='}", Valor "8"</li>
                          <li>5. Defina lógica como "OU (OR)"</li>
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Exemplo 3: Combinação Complexa</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <p><strong>Objetivo:</strong> Elegível para tratamento</p>
                        <p><strong>Regra:</strong> (imc ENTRE 18.5 e 30) E (pergunta_diabetes = "não") E (idade {'<'} 70)</p>
                        <p><strong>Como fazer:</strong></p>
                        <ol className="ml-4 space-y-1">
                          <li>1. Adicione resultado de cálculo: imc</li>
                          <li>2. Adicione resposta de pergunta: pergunta_diabetes</li>
                          <li>3. Adicione campo numérico: idade</li>
                          <li>4. Crie 3 regras conforme especificado</li>
                          <li>5. Defina lógica como "E (AND)"</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={conditions.length === 0}
            className="bg-[#5D8701] hover:bg-[#4a6e01]"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Condições
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};