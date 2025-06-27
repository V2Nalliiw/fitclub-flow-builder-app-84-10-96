
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCheck, Send, FileImage, FileVideo, File, Download } from 'lucide-react';
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
      default: return <Download className="h-3 w-3" />;
    }
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-44 h-36 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(34,197,94,0.3),0_8px_25px_rgba(34,197,94,0.2)] border-green-400 dark:border-green-600' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}
      style={{
        borderRadius: '4px 12px 12px 4px'
      }}>
        {/* Lado esquerdo com gradiente */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600" />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-white" />
          <div className="text-xs font-semibold text-white tracking-tight">
            Fim de Formulário
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 justify-center mb-2">
            {getContentIcon()}
            <span className="font-medium">
              Envia {data.tipoConteudo || 'conteúdo'}
            </span>
          </div>
          
          {data.arquivo && (
            <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
              📎 {data.arquivo.length > 20 ? data.arquivo.substring(0, 20) + '...' : data.arquivo}
            </div>
          )}
        </div>
        
        {/* Footer com efeito envelope */}
        <div className="h-2 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800" />
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="formEnd"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-green-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-green-500 border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
