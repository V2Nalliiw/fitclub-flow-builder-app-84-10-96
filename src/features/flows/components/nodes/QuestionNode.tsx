
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
  const hasContent = data.pergunta || opcoes.length > 0;
  const minHeight = hasContent ? 36 : 32;

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-36 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(147,51,234,0.3),0_8px_25px_rgba(147,51,234,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}
      style={{ minHeight: `${minHeight * 4}px` }}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10" />
        
        <HelpCircle className="h-6 w-6 mb-1 relative z-10" />
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
          Pergunta
        </div>
        
        <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10">
          {getQuestionIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        
        {opcoes.length > 0 && (
          <div className="text-[10px] opacity-80 text-center relative z-10 mt-1">
            {opcoes.length} opções
          </div>
        )}
      </div>
      
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
        className="w-3.5 h-3.5 bg-purple-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      
      {/* Handle padrão para múltipla escolha, texto livre ou quando não há opções */}
      {(!isEscolhaUnica || opcoes.length === 0) && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3.5 h-3.5 bg-purple-500 border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
        />
      )}
      
      {/* Handles múltiplos para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
          {opcoes.map((opcao: string, index: number) => (
            <div key={index} className="relative group/handle">
              <Handle
                type="source"
                position={Position.Right}
                id={`opcao-${index}`}
                className="w-3.5 h-3.5 bg-purple-500 border-2 border-white shadow-md relative !static !transform-none"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[10px] text-purple-600 dark:text-purple-400 whitespace-nowrap bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md opacity-0 group-hover/handle:opacity-100 transition-opacity z-20 border border-purple-200 dark:border-purple-700">
                {opcao.substring(0, 20)}{opcao.length > 20 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
