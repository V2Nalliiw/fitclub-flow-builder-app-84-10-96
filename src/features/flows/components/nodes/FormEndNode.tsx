
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCheck, Send, FileImage, FileVideo, File } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface FormEndNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormEndNode: React.FC<FormEndNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  const getContentIcon = () => {
    switch (data.tipoConteudo) {
      case 'imagem': return <FileImage className="h-3 w-3" />;
      case 'video': return <FileVideo className="h-3 w-3" />;
      case 'pdf': return <File className="h-3 w-3" />;
      case 'ebook': return <File className="h-3 w-3" />;
      default: return <Send className="h-3 w-3" />;
    }
  };

  return (
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-green-500 text-white border-2 transition-all duration-200 min-w-[200px] ${
      selected ? 'border-white shadow-lg scale-105' : 'border-green-600'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <FileCheck className="h-5 w-5" />
        <div className="text-sm font-medium">Fim de Formulário</div>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
        {getContentIcon()}
        <span>
          Envia {data.tipoConteudo || 'conteúdo'}
        </span>
      </div>
      {data.arquivo && (
        <div className="text-xs opacity-80 truncate">
          📎 {data.arquivo}
        </div>
      )}
      
      <NodeActions
        nodeId={id}
        nodeType="formEnd"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={true}
      />
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
};
