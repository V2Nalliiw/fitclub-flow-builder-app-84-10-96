
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
    <div className={`group relative px-4 py-4 shadow-md rounded-lg bg-white dark:bg-white/10 text-foreground border transition-all duration-200 w-44 min-h-36 flex flex-col justify-start ${
      selected ? 'border-primary shadow-lg scale-105' : 'border-border'
    }`}>
      <div className="flex items-center gap-2 justify-center mb-2">
        <HelpCircle className="h-5 w-5 text-purple-500" />
        <div className="text-sm font-medium">Pergunta</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center mb-2">
        {getQuestionIcon()}
        <span>{getTypeLabel()}</span>
      </div>
      {data.pergunta && (
        <div className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">
          {data.pergunta}
        </div>
      )}
      
      {/* Mostrar opções para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="space-y-1 mb-2 flex-1">
          {opcoes.slice(0, 3).map((opcao: string, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate text-center">
              • {opcao}
            </div>
          ))}
          {opcoes.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{opcoes.length - 3} mais...
            </div>
          )}
        </div>
      )}
      
      {opcoes.length > 0 && !isEscolhaUnica && (
        <div className="text-xs text-muted-foreground text-center mt-auto">
          {opcoes.length} opções
        </div>
      )}
      
      <NodeActions
        nodeId={id}
        nodeType="question"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      
      {/* Handle padrão para múltipla escolha, texto livre ou quando não há opções */}
      {(!isEscolhaUnica || opcoes.length === 0) && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      )}
      
      {/* Handles múltiplos para escolha única - organizados verticalmente na borda direita */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          {opcoes.map((opcao: string, index: number) => (
            <div key={index} className="relative group/handle">
              <Handle
                type="source"
                position={Position.Right}
                id={`opcao-${index}`}
                className="w-3 h-3 bg-purple-500 border-2 border-white relative"
                style={{ 
                  position: 'relative',
                  left: 0,
                  top: 0,
                  transform: 'none'
                }}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap bg-background/80 backdrop-blur-sm px-1 rounded opacity-0 group-hover/handle:opacity-100 transition-opacity z-10">
                {opcao.substring(0, 15)}{opcao.length > 15 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
