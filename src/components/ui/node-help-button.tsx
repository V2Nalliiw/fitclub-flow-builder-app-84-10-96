import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NodeHelpButtonProps {
  nodeType: string;
  className?: string;
}

const getHelpContent = (nodeType: string) => {
  const helpContent: Record<string, { title: string; description: string; tips?: string[] }> = {
    start: {
      title: 'Nó Inicial',
      description: 'Este é o ponto de partida do seu fluxo. Todo fluxo deve começar com este nó.',
      tips: ['Não pode ser removido', 'Sempre o primeiro passo do fluxo']
    },
    end: {
      title: 'Fim do Fluxo',
      description: 'Marca o final do fluxo. Pode incluir uma mensagem final opcional.',
      tips: ['Configure mensagem final se necessário', 'Ponto final de execução']
    },
    number: {
      title: 'Campo Número',
      description: 'Coleta um valor numérico do usuário. Use nomenclatura única para referenciar em cálculos.',
      tips: ['Nomenclatura deve ser única', 'Use prefixo/sufixo para contexto', 'Pode ser usado em cálculos']
    },
    simpleCalculator: {
      title: 'Cálculo Simples',
      description: 'Realiza operações matemáticas básicas usando valores de nós número conectados.',
      tips: ['Use nomenclaturas dos nós número', 'Operadores: +, -, *, /', 'Exemplo: peso + altura * 2']
    },
    question: {
      title: 'Pergunta',
      description: 'Apresenta uma pergunta com opções de resposta para o usuário escolher.',
      tips: ['Configure as opções de resposta', 'Cada opção pode levar a caminhos diferentes']
    },
    conditions: {
      title: 'Condições',
      description: 'Avalia condições baseadas em resultados anteriores para criar caminhos condicionais.',
      tips: ['Use resultados de cálculos', 'Configure operadores (>, <, =)', 'Cada condição gera uma saída']
    },
    specialConditions: {
      title: 'Condições Especiais',
      description: 'Sistema avançado de condições que pode combinar múltiplos tipos de dados.',
      tips: ['Combine números, perguntas e cálculos', 'Use operadores como "entre X e Y"', 'Configure condições complexas']
    },
    calculator: {
      title: 'Calculadora',
      description: 'Calculadora avançada com múltiplos campos e fórmulas personalizadas.',
      tips: ['Configure múltiplos campos', 'Use fórmulas complexas', 'Nomenclaturas únicas obrigatórias']
    },
    delay: {
      title: 'Aguardar',
      description: 'Pausa a execução do fluxo por um período determinado.',
      tips: ['Configure tempo em minutos, horas ou dias', 'Útil para intervalos entre etapas']
    },
    formStart: {
      title: 'Início de Formulário',
      description: 'Envia um link via WhatsApp para um formulário externo.',
      tips: ['Configure o formulário desejado', 'Paciente recebe link via WhatsApp']
    },
    formEnd: {
      title: 'Fim de Formulário',
      description: 'Processa resultados de formulário e pode gerar documentos.',
      tips: ['Configure tipo de conteúdo', 'Pode gerar PDFs, imagens, etc.']
    },
    formSelect: {
      title: 'Formulário Selecionado',
      description: 'Permite escolher qual formulário será apresentado ao paciente.',
      tips: ['Selecione entre formulários disponíveis', 'Configure conforme necessidade']
    }
  };

  return helpContent[nodeType] || {
    title: 'Nó',
    description: 'Nó do fluxo de trabalho.',
    tips: []
  };
};

export const NodeHelpButton: React.FC<NodeHelpButtonProps> = ({ nodeType, className = '' }) => {
  const { title, description, tips } = getHelpContent(nodeType);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`w-6 h-6 p-0 hover:bg-muted/80 ${className}`}
          title="Ajuda"
          type="button"
        >
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="center">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          
          {tips && tips.length > 0 && (
            <div>
              <h5 className="font-medium text-xs text-foreground mb-2">💡 Dicas:</h5>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};