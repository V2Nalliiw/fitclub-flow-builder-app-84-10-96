
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCheck, Download } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface FormEndNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormEndNode: React.FC<FormEndNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-36 h-32 rounded-lg bg-gradient-to-br from-green-500/70 to-green-600/70 backdrop-blur-sm shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden border border-green-500/20 ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(34,197,94,0.3),0_8px_25px_rgba(34,197,94,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10" />
        
        {/* Linhas de conclusão no fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="flex flex-col gap-1 p-3 pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-white/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        <FileCheck className="h-6 w-6 mb-1 relative z-10" />
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
          Fim Formulário
        </div>
        
        <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10">
          <Download className="h-2.5 w-2.5" />
          <span>Entrega {data.tipoConteudo || 'conteúdo'}</span>
        </div>
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
