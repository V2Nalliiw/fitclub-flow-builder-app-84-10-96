
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type, List } from 'lucide-react';
import { SimpleNodeActions } from '../SimpleNodeActions';

interface QuestionNodeProps {
  data: {
    tipoResposta?: 'escolha-unica' | 'multipla-escolha';
    tipoExibicao?: 'aberto' | 'select';
    opcoes?: string[];
    onDelete?: (nodeId: string) => void;
  } & any;
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
      default: return 'Configurar tipo';
    }
  };

  const getExibicaoLabel = () => {
    switch (data.tipoExibicao) {
      case 'select': return 'Dropdown';
      case 'aberto': return 'Opções abertas';
      default: return 'Aberto';
    }
  };

  const isEscolhaUnica = data.tipoResposta === 'escolha-unica';
  const opcoes = data.opcoes || [];

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-48 min-h-32 rounded-xl bg-white dark:bg-none dark:bg-[#0E0E0E]/90 border border-gray-200 dark:border-[#1A1A1A] shadow-sm transition-all duration-200 relative overflow-visible ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-[#1A1A1A]'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Pergunta</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-[#1A1A1A]"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            {getQuestionIcon()}
            <span>{getTypeLabel()}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <span>Exibição:</span>
            <span className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {data.tipoExibicao === 'select' ? 'Dropdown' : 'Aberto'}
            </span>
          </div>
          
          {/* Mostrar opções para escolha única */}
          {isEscolhaUnica && opcoes.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">Opções de saída:</div>
              {opcoes.map((opcao: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-xs p-1 bg-amber-50 rounded border"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `hsl(${(index * 360) / opcoes.length}, 70%, 60%)` }}
                  />
                  <span className="truncate flex-1" title={opcao}>
                    {opcao.length > 15 ? `${opcao.substring(0, 15)}...` : opcao}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {!isEscolhaUnica && opcoes.length > 0 && (
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
      
      {/* Handles múltiplos para escolha única com melhor posicionamento */}
      {isEscolhaUnica && opcoes.length > 0 && (
        <>
          {opcoes.map((opcao: string, index: number) => {
            const totalOpcoes = opcoes.length;
            const nodeHeight = 128; // altura mínima do nó
            const handleSpacing = Math.min(32, nodeHeight / (totalOpcoes + 1));
            const startY = -(nodeHeight / 2) + handleSpacing;
            const offsetY = startY + (index * handleSpacing);
            
            return (
              <React.Fragment key={index}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`opcao-${index}`}
                  className="!w-3.5 !h-3.5 !border-2 !border-white !shadow-md"
                  style={{
                    right: '-7px',
                    top: '50%',
                    transform: `translate(50%, calc(-50% + ${offsetY}px))`,
                    position: 'absolute',
                    backgroundColor: `hsl(${(index * 360) / opcoes.length}, 70%, 60%)`,
                    zIndex: 10
                  }}
                />
                
                {/* Label ao lado do handle */}
                 <div 
                  className="absolute pointer-events-none z-20 text-xs bg-white/90 dark:bg-none dark:bg-[#0E0E0E]/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 dark:border-[#1A1A1A] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    right: '-140px',
                    top: '50%',
                    transform: `translateY(calc(-50% + ${offsetY}px))`,
                    color: `hsl(${(index * 360) / opcoes.length}, 70%, 40%)`,
                    borderColor: `hsl(${(index * 360) / opcoes.length}, 70%, 60%)`,
                  }}
                >
                  {opcao.length > 20 ? `${opcao.substring(0, 20)}...` : opcao}
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
    </div>
  );
};
