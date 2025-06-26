
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type, List } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface QuestionNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const QuestionNode: React.FC<QuestionNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  const getQuestionIcon = () => {
    switch (data.tipoResposta) {
      case 'escolha-unica': return <Circle className="h-3 w-3" />;
      case 'multipla-escolha': return <CheckSquare className="h-3 w-3" />;
      case 'texto-livre': return <Type className="h-3 w-3" />;
      default: return <List className="h-3 w-3" />;
    }
  };

  const getTypeLabel = () => {
    switch (data.tipoResposta) {
      case 'escolha-unica': return 'Escolha única';
      case 'multipla-escolha': return 'Múltipla escolha';
      case 'texto-livre': return 'Texto livre';
      default: return 'Configurar tipo';
    }
  };

  const isEscolhaUnica = data.tipoResposta === 'escolha-unica';
  const opcoes = data.opcoes || [];

  return (
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-white dark:bg-white/10 text-foreground border transition-all duration-200 min-w-[200px] ${
      selected ? 'border-primary shadow-lg scale-105' : 'border-border'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="h-5 w-5 text-purple-500" />
        <div className="text-sm font-medium">Pergunta</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {getQuestionIcon()}
        <span>{getTypeLabel()}</span>
      </div>
      {data.pergunta && (
        <div className="text-xs text-muted-foreground truncate mb-2">
          {data.pergunta}
        </div>
      )}
      
      {/* Mostrar opções para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="space-y-1 mb-2">
          {opcoes.slice(0, 3).map((opcao: string, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {opcao}
            </div>
          ))}
          {opcoes.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{opcoes.length - 3} mais...
            </div>
          )}
        </div>
      )}
      
      {opcoes.length > 0 && !isEscolhaUnica && (
        <div className="text-xs text-muted-foreground mt-1">
          {opcoes.length} opções
        </div>
      )}
      
      <NodeActions
        nodeId={id}
        nodeType="question"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={true}
      />
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      
      {/* Handle padrão para múltipla escolha, texto livre ou quando não há opções */}
      {(!isEscolhaUnica || opcoes.length === 0) && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      )}
      
      {/* Handles múltiplos para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="flex justify-around mt-2">
          {opcoes.map((opcao: string, index: number) => (
            <div key={index} className="relative">
              <Handle
                type="source"
                position={Position.Bottom}
                id={`opcao-${index}`}
                className="w-3 h-3 bg-purple-500 border-2 border-white"
                style={{ 
                  position: 'relative',
                  left: 0,
                  bottom: 0,
                  transform: 'none'
                }}
              />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                {opcao.substring(0, 8)}{opcao.length > 8 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
