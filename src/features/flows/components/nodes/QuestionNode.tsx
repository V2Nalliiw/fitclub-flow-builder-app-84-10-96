
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, Circle, Type } from 'lucide-react';

export const QuestionNode = ({ data }: { data: any }) => {
  const getQuestionIcon = () => {
    switch (data.questionType) {
      case 'single': return <Circle className="h-3 w-3" />;
      case 'multiple': return <CheckSquare className="h-3 w-3" />;
      case 'text': return <Type className="h-3 w-3" />;
      default: return <HelpCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-purple-500 text-white border-2 border-purple-600 min-w-[170px]">
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90">
        {getQuestionIcon()}
        <span>
          {data.questionType === 'single' && 'Escolha única'}
          {data.questionType === 'multiple' && 'Múltipla escolha'}
          {data.questionType === 'text' && 'Texto livre'}
          {!data.questionType && 'Configurar tipo'}
        </span>
      </div>
      
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
