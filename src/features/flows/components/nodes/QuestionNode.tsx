
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
        <div className="text-xs opacity-80 truncate">
          {data.pergunta}
        </div>
      )}
      {data.opcoes && data.opcoes.length > 0 && (
        <div className="text-xs opacity-70 mt-1">
          {data.opcoes.length} opções
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
};
