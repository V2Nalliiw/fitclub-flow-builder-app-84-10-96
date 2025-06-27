
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Timer } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface DelayNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const DelayNode: React.FC<DelayNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  const getTimeLabel = () => {
    const quantidade = data.quantidade || 1;
    const tipo = data.tipoIntervalo || 'dias';
    return `${quantidade} ${tipo}`;
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-32 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden ${
        selected 
          ? 'shadow-[0_0_0_3px_rgba(251,146,60,0.3),0_8px_25px_rgba(251,146,60,0.2)]' 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/10" />
        
        {/* Ícone de relógio com animação sutil */}
        <div className="relative z-10 mb-1">
          <Clock className="h-6 w-6" />
        </div>
        
        <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
          Aguardar
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full relative z-10">
          <Timer className="h-2.5 w-2.5" />
          <span>{getTimeLabel()}</span>
        </div>
      </div>
      
      <NodeActions
        nodeId={id}
        nodeType="delay"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-orange-500 border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-orange-500 border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
      />
    </div>
  );
};
