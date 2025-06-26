
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type, List } from 'lucide-react';

export const QuestionNode = ({ data, selected }: { data: any; selected?: boolean }) => {
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
    <div className={`px-4 py-3 shadow-md rounded-lg bg-purple-500 text-white border-2 transition-all duration-200 min-w-[200px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-purple-600'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="h-5 w-5" />
        <div className="text-sm font-medium">Pergunta</div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
        {getQuestionIcon()}
        <span>{getTypeLabel()}</span>
      </div>
      {data.pergunta && (
        <div className="text-xs opacity-80 truncate mb-2">
          {data.pergunta}
        </div>
      )}
      
      {/* Mostrar opções para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <div className="space-y-1 mb-2">
          {opcoes.slice(0, 3).map((opcao: string, index: number) => (
            <div key={index} className="text-xs opacity-70 truncate">
              • {opcao}
            </div>
          ))}
          {opcoes.length > 3 && (
            <div className="text-xs opacity-60">
              +{opcoes.length - 3} mais...
            </div>
          )}
        </div>
      )}
      
      {opcoes.length > 0 && !isEscolhaUnica && (
        <div className="text-xs opacity-70 mt-1">
          {opcoes.length} opções
        </div>
      )}
      
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
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-70 whitespace-nowrap">
                {opcao.substring(0, 8)}{opcao.length > 8 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
