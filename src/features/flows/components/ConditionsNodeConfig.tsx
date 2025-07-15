import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GitBranch, Hash, HelpCircle } from 'lucide-react';
import { CompositeCondition, CompositeConditionRule } from '@/types/flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ConditionsNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  availableCalculations?: { nomenclatura: string; label: string }[];
  availableQuestions?: { nomenclatura: string; pergunta: string; opcoes: string[]; respostasDisponiveis?: string[] }[];
}

const ConditionsNodeConfig: React.FC<ConditionsNodeConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableCalculations = [],
  availableQuestions = []
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [compositeConditions, setCompositeConditions] = useState<CompositeCondition[]>([]);

  // Sincronizar estado com initialData quando modal abre ou dados mudam
  useEffect(() => {
    console.log('🔍 Conditions useEffect triggered:', { isOpen, hasInitialData: !!initialData });
    
    if (isOpen && initialData) {
      console.log('🚀 Conditions modal opened with initial data:', initialData);
      console.log('📋 Composite conditions in data:', initialData.compositeConditions);
      console.log('📄 Title in data:', initialData.titulo);
      console.log('📝 Description in data:', initialData.descricao);
      
      setTitulo(initialData.titulo || '');
      setDescricao(initialData.descricao || '');
      setCompositeConditions(initialData.compositeConditions || []);
      
      console.log('✅ Conditions state updated with initial data');
    } else if (isOpen && !initialData) {
      console.log('🆕 Conditions modal opened with no initial data - resetting');
      
      setTitulo('');
      setDescricao('');
      setCompositeConditions([]);
    } else if (!isOpen) {
      console.log('🚪 Conditions modal closed');
    }
  }, [isOpen, initialData]);

  const operatorsCalculation = [
    { value: 'equal', label: 'Igual a (=)' },
    { value: 'greater', label: 'Maior que (>)' },
    { value: 'less', label: 'Menor que (<)' },
    { value: 'greater_equal', label: 'Maior ou igual (≥)' },
    { value: 'less_equal', label: 'Menor ou igual (≤)' },
    { value: 'not_equal', label: 'Diferente de (≠)' },
    { value: 'between', label: 'Entre (x a y)' },
  ];

  const operatorsQuestion = [
    { value: 'equal', label: 'Igual a (=)' },
    { value: 'not_equal', label: 'Diferente de (≠)' },
    { value: 'contains', label: 'Contém' },
    { value: 'in', label: 'Está em' },
  ];

  const addCondition = () => {
    const newCondition: CompositeCondition = {
      id: `composite_${Date.now()}`,
      label: `Condição ${compositeConditions.length + 1}`,
      logic: 'AND',
      rules: []
    };
    setCompositeConditions([...compositeConditions, newCondition]);
  };

  const updateCondition = (index: number, updates: Partial<CompositeCondition>) => {
    const updatedConditions = compositeConditions.map((condition, i) => 
      i === index ? { ...condition, ...updates } : condition
    );
    setCompositeConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    setCompositeConditions(compositeConditions.filter((_, i) => i !== index));
  };

  const addRule = (conditionIndex: number) => {
    const newRule: CompositeConditionRule = {
      id: `rule_${Date.now()}`,
      sourceType: 'calculation',
      sourceField: '',
      operator: 'equal',
      value: ''
    };
    
    const condition = compositeConditions[conditionIndex];
    const updatedRules = [...condition.rules, newRule];
    updateCondition(conditionIndex, { rules: updatedRules });
  };

  const updateRule = (conditionIndex: number, ruleIndex: number, updates: Partial<CompositeConditionRule>) => {
    const condition = compositeConditions[conditionIndex];
    const updatedRules = condition.rules.map((rule, i) => 
      i === ruleIndex ? { ...rule, ...updates } : rule
    );
    updateCondition(conditionIndex, { rules: updatedRules });
  };

  const removeRule = (conditionIndex: number, ruleIndex: number) => {
    const condition = compositeConditions[conditionIndex];
    const updatedRules = condition.rules.filter((_, i) => i !== ruleIndex);
    updateCondition(conditionIndex, { rules: updatedRules });
  };

  const getSourceOptions = (sourceType: 'calculation' | 'question') => {
    if (sourceType === 'calculation') {
      return availableCalculations.map(calc => ({
        value: calc.nomenclatura,
        label: `${calc.label} (${calc.nomenclatura})`
      }));
    } else {
      return availableQuestions.map(quest => ({
        value: quest.nomenclatura,
        label: `${quest.pergunta} (${quest.nomenclatura})`
      }));
    }
  };

  const getQuestionOptions = (nomenclatura: string) => {
    const question = availableQuestions.find(q => q.nomenclatura === nomenclatura);
    console.log('🔍 Getting question options for:', nomenclatura);
    console.log('📦 Found question:', question);
    console.log('📋 Available options:', question?.respostasDisponiveis || question?.opcoes || []);
    return question?.respostasDisponiveis || question?.opcoes || [];
  };

  const getOperators = (sourceType: 'calculation' | 'question') => {
    return sourceType === 'calculation' ? operatorsCalculation : operatorsQuestion;
  };

  const getConditionPreview = (condition: CompositeCondition) => {
    if (condition.rules.length === 0) return 'Nenhuma regra configurada';
    
    const rulePreviews = condition.rules.map(rule => {
      const sourceIcon = rule.sourceType === 'calculation' ? '🧮' : '❓';
      const operatorLabel = getOperators(rule.sourceType).find(op => op.value === rule.operator)?.label || rule.operator;
      
      return `${sourceIcon} ${rule.sourceField} ${operatorLabel.toLowerCase()} ${rule.value}${rule.valueEnd ? ` e ${rule.valueEnd}` : ''}`;
    });

    return `SE (${rulePreviews.join(` ${condition.logic} `)}) ENTÃO ${condition.label}`;
  };

  const handleSave = () => {
    console.log('🧩 Conditions handleSave called with:');
    console.log('📄 Title:', titulo);
    console.log('📝 Description:', descricao);
    console.log('📋 Composite conditions:', compositeConditions);
    
    const data = {
      titulo,
      descricao,
      compositeConditions,
      label: titulo || 'Condições',
    };
    
    console.log('💾 Final conditions data to save:', data);
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Configurar Nó Condições Compostas
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
                placeholder="Ex: Avaliação Completa"
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
          </div>

          {/* Dados Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-blue-600" />
                  Cálculos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableCalculations.length > 0 ? (
                  <div className="space-y-1">
                    {availableCalculations.map((calc, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {calc.nomenclatura}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum cálculo disponível</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4 text-green-600" />
                  Perguntas Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableQuestions.length > 0 ? (
                  <div className="space-y-1">
                    {availableQuestions.map((quest, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {quest.nomenclatura}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma pergunta disponível</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Condições Compostas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Condições Compostas</h3>
              <Button onClick={addCondition} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Condição
              </Button>
            </div>

            {compositeConditions.map((condition, conditionIndex) => (
              <Card key={condition.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      Condição {conditionIndex + 1}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(conditionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info da Condição */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nome da Condição</Label>
                      <Input
                        value={condition.label}
                        onChange={(e) => updateCondition(conditionIndex, { label: e.target.value })}
                        placeholder="Ex: Peso Normal e Ativo"
                      />
                    </div>
                    <div>
                      <Label>Operador Lógico</Label>
                      <Select
                        value={condition.logic}
                        onValueChange={(value: 'AND' | 'OR') => updateCondition(conditionIndex, { logic: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">E (AND) - Todas as regras</SelectItem>
                          <SelectItem value="OR">OU (OR) - Pelo menos uma regra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => addRule(conditionIndex)} size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Regra
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Regras */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Regras da Condição</Label>
                    
                    {condition.rules.map((rule, ruleIndex) => (
                      <Card key={rule.id} className="bg-gray-50 border">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Regra {ruleIndex + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRule(conditionIndex, ruleIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Tipo de Fonte */}
                            <div>
                              <Label>Fonte</Label>
                              <Select
                                value={rule.sourceType}
                                onValueChange={(value: 'calculation' | 'question') => {
                                  updateRule(conditionIndex, ruleIndex, { 
                                    sourceType: value, 
                                    sourceField: '',
                                    value: ''
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="calculation">
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-blue-600" />
                                      Cálculo
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="question">
                                    <div className="flex items-center gap-2">
                                      <HelpCircle className="h-4 w-4 text-green-600" />
                                      Pergunta
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Campo */}
                            <div>
                              <Label>Campo</Label>
                              <Select
                                value={rule.sourceField}
                                onValueChange={(value) => updateRule(conditionIndex, ruleIndex, { sourceField: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {getSourceOptions(rule.sourceType).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Operador */}
                            <div>
                              <Label>Operador</Label>
                              <Select
                                value={rule.operator}
                                onValueChange={(value) => updateRule(conditionIndex, ruleIndex, { operator: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getOperators(rule.sourceType).map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Valor */}
                            <div>
                              <Label>Valor</Label>
                              {rule.sourceType === 'question' && rule.sourceField ? (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateRule(conditionIndex, ruleIndex, { value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getQuestionOptions(rule.sourceField).map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={rule.sourceType === 'calculation' ? 'number' : 'text'}
                                  step="0.01"
                                  value={rule.value}
                                  onChange={(e) => updateRule(conditionIndex, ruleIndex, { value: e.target.value })}
                                  placeholder="Digite o valor..."
                                />
                              )}
                            </div>
                          </div>

                          {/* Valor Final para operador "between" */}
                          {rule.operator === 'between' && (
                            <div className="mt-3">
                              <Label>Valor Final</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={rule.valueEnd || ''}
                                onChange={(e) => updateRule(conditionIndex, ruleIndex, { valueEnd: e.target.value })}
                                placeholder="Digite o valor final..."
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {condition.rules.length === 0 && (
                      <div className="text-center text-gray-500 py-4 border border-dashed rounded">
                        Nenhuma regra configurada. Clique em "Adicionar Regra" para começar.
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <strong>Preview:</strong> {getConditionPreview(condition)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {compositeConditions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma condição configurada. Adicione condições compostas para criar caminhos diferentes no fluxo.
              </div>
            )}
          </div>

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

export default ConditionsNodeConfig;