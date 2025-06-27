
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square, MessageCircle } from 'lucide-react';
import { NodeActions } from '../NodeActions';

interface EndNodeProps {
  data: any;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const EndNode: React.FC<EndNodeProps> = ({ data, selected, id, onDelete, onDuplicate }) => {
  return (
    <div className={`group relative px-4 py-3 shadow-md rounded-lg bg-white dark:bg-white/10 text-foreground border transition-all duration-200 min-w-[160px] ${
      selected ? 'border-primary shadow-lg scale-105' : 'border-border'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Square className="h-5 w-5 text-red-500" />
        <div className="text-sm font-medium">Fim do Fluxo</div>
      </div>
      {data.mensagemFinal && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle className="h-3 w-3" />
          <span>Com mensagem final</span>
        </div>
      )}
      
      <NodeActions
        nodeId={id}
        nodeType="end"
        onDelete={onDelete || (() => {})}
        onDuplicate={onDuplicate || (() => {})}
        visible={selected}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
};
