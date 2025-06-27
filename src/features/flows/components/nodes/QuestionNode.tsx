
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type, List, MessageSquare } from 'lucide-react';
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
  const minHeight = hasContent ? 160 : 140;

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-44 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(147,51,234,0.3),0_8px_25px_rgba(147,51,234,0.2)] border-purple-400 dark:border-purple-600' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}
      style={{
        minHeight: `${minHeight}px`,
        borderRadius: '16px 16px 16px 4px',
        position: 'relative'
      }}>
        {/* Chat bubble tail */}
        <div 
          className="absolute -left-2 bottom-4 w-4 h-4 bg-white dark:bg-gray-900 border-l-2 border-b-2 border-purple-200 dark:border-purple-800 transform rotate-45"
          style={{
            clipPath: 'polygon(0 0, 100% 100%, 0 100%)'
          }}
        />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 flex items-center gap-2 rounded-t-2xl">
          <HelpCircle className="h-4 w-4 text-white" />
          <div className="text-xs font-semibold text-white tracking-tight">
            Pergunta
          </div>
          <MessageSquare className="h-3 w-3 ml-auto text-white/80" />
        </div>
        
        {/* Body */}
        <div className="flex-1 p-3 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 justify-center mb-2">
            {getQuestionIcon()}
            <span className="font-medium">{getTypeLabel()}</span>
          </div>
          
          {data.pergunta && (
            <div className="text-xs text-gray-700 dark:text-gray-300 text-center mb-3 line-clamp-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              {data.pergunta}
            </div>
          )}
          
          {/* Opções para escolha única */}
          {isEscolhaUnica && opcoes.length > 0 && (
            <div className="space-y-1 flex-1">
              {opcoes.slice(0, 3).map((opcao: string, index: number) => (
                <div key={index} className="text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                    <Circle className="h-2 w-2" />
                    {opcao.substring(0, 12)}{opcao.length > 12 ? '...' : ''}
                  </span>
                </div>
              ))}
              {opcoes.length > 3 && (
                <div className="text-[10px] text-purple-600 dark:text-purple-400 text-center">
                  +{opcoes.length - 3} opções...
                </div>
              )}
            </div>
          )}
          
          {opcoes.length > 0 && !isEscolhaUnica && (
            <div className="text-[10px] text-purple-600 dark:text-purple-400 text-center mt-auto bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
              {opcoes.length} opções disponíveis
            </div>
          )}
        </div>
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
