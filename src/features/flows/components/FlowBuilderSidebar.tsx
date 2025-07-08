import React from 'react';
import { Play, Square, Clock, FileText, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calculator, GitBranch } from 'lucide-react';

interface FlowBuilderSidebarProps {
  onAddNode: (type: string) => void;
  onClearAll: () => void;
  onAutoArrange: () => void;
  selectedNode: any;
  onConfigureNode: () => void;
  onDeleteNode: (nodeId: string) => void;
}

const FlowBuilderSidebar: React.FC<FlowBuilderSidebarProps> = ({
  onAddNode,
  onClearAll,
  onAutoArrange,
  selectedNode,
  onConfigureNode,
  onDeleteNode,
}) => {
  const nodeCategories = [
    {
      title: "Controle de Fluxo",
      nodes: [
        { type: 'start', label: 'Início', icon: Play, description: 'Ponto de início do fluxo' },
        { type: 'end', label: 'Fim', icon: Square, description: 'Ponto de fim do fluxo' },
        { type: 'delay', label: 'Aguardar', icon: Clock, description: 'Pausa por tempo determinado' },
      ]
    },
    {
      title: "Formulários",
      nodes: [
        { type: 'formStart', label: 'Início Form', icon: FileText, description: 'Início de formulário' },
        { type: 'formEnd', label: 'Fim Form', icon: CheckCircle, description: 'Fim de formulário' },
        { type: 'question', label: 'Pergunta', icon: MessageCircle, description: 'Pergunta individual' },
      ]
    },
    {
      title: "Lógica e Cálculos",
      nodes: [
        { type: 'calculator', label: 'Calculadora', icon: Calculator, description: 'Coleta dados e calcula resultado' },
        { type: 'conditions', label: 'Condições', icon: GitBranch, description: 'Decisões baseadas em condições' },
      ]
    }
  ];

  return (
    <Card className="w-64 flex-shrink-0 border-r bg-gray-100 dark:bg-none dark:bg-[#0E0E0E]">
      <CardHeader>
        <CardTitle>Construtor de Fluxos</CardTitle>
        <CardDescription>Arraste e configure os nós</CardDescription>
      </CardHeader>
      <CardContent className="p-2 space-y-4">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {nodeCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-sm font-bold px-2">{category.title}</h4>
                <div className="space-y-1">
                  {category.nodes.map((node) => (
                    <Button
                      key={node.type}
                      variant="ghost"
                      className="w-full justify-start px-3.5"
                      onClick={() => onAddNode(node.type)}
                    >
                      <node.icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{node.label}</span>
                    </Button>
                  ))}
                </div>
                {index < nodeCategories.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 space-y-2">
          <Separator />
          <Button variant="outline" className="w-full" onClick={onClearAll}>
            Limpar Tudo
          </Button>
          <Button variant="outline" className="w-full" onClick={onAutoArrange}>
            Organizar Nós
          </Button>
        </div>
      </CardContent>
      {selectedNode && (
        <div className="p-4">
          <Separator />
          <h4 className="mb-2 text-sm font-bold">Nó Selecionado</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedNode.type}: {selectedNode.data.label}
          </p>
          <Button variant="secondary" className="w-full mt-2" onClick={onConfigureNode}>
            Configurar Nó
          </Button>
          <Button variant="destructive" className="w-full mt-2" onClick={() => onDeleteNode(selectedNode.id)}>
            Excluir Nó
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FlowBuilderSidebar;
