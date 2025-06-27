
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type, List } from 'lucide-react';
import { SimpleNodeActions } from '../SimpleNodeActions';

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
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-40 h-24 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 relative ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Pergunta</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2 space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            {getQuestionIcon()}
            <span>{getTypeLabel()}</span>
          </div>
          {opcoes.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {opcoes.length} opções
            </div>
          )}
        </div>
      </div>
      
      <SimpleNodeActions
        nodeId={id}
        nodeType="question"
        onDelete={data?.onDelete}
        show={selected}
      />
      
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      
      {/* Handle padrão para múltipla escolha, texto livre ou quando não há opções */}
      {!isEscolhaUnica && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
        />
      )}
      
      {/* Handles múltiplos para escolha única */}
      {isEscolhaUnica && opcoes.length > 0 && opcoes.map((opcao: string, index: number) => {
        // Calcular posição vertical baseada no número de opções
        const totalOpcoes = opcoes.length;
        const spacing = Math.min(20, 40 / Math.max(1, totalOpcoes - 1)); // Espaçamento máximo de 20px
        const startY = totalOpcoes > 1 ? -(totalOpcoes - 1) * spacing / 2 : 0;
        const offsetY = startY + index * spacing;
        
        return (
          <React.Fragment key={index}>
            <Handle
              type="source"
              position={Position.Right}
              id={`opcao-${index}`}
              className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md"
              style={{
                top: `calc(50% + ${offsetY}px)`,
                right: '-7px',
                position: 'absolute',
                transform: 'translateY(-50%)',
                zIndex: 10
              }}
            />
            
            {/* Tooltip com nome da opção */}
            <div 
              className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap"
              style={{
                top: `calc(50% + ${offsetY}px)`,
                right: '-120px',
                transform: 'translateY(-50%)',
              }}
            >
              {opcao.length > 20 ? `${opcao.substring(0, 20)}...` : opcao}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
