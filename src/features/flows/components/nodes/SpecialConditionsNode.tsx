import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { SimpleNodeActions } from '../SimpleNodeActions';

interface SpecialConditionsNodeProps {
  data: {
    label: string;
    condicoesEspeciais?: any[];
    onDelete?: (nodeId: string) => void;
    onEdit?: () => void;
  };
  id: string;
  selected?: boolean;
}

const SpecialConditionsNode: React.FC<SpecialConditionsNodeProps> = ({ data, id, selected }) => {

  const condicoes = data.condicoesEspeciais || [];
  const condicaoCount = condicoes.length;

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-56 min-h-36 rounded-xl bg-white dark:bg-[#0E0E0E]/90 border border-gray-200 dark:border-[#1A1A1A] shadow-sm transition-all duration-200 relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-[#1A1A1A]'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <GitBranch className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Condições Especiais</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2 space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">{data.label}</div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <span>🔀</span>
              <span>{condicaoCount} condições especiais</span>
            </div>
          </div>

          {/* Lista das condições especiais */}
          {condicoes.length > 0 && (
            <div className="space-y-1 mb-4">
              {condicoes.slice(0, 3).map((condicao, index) => (
                <div
                  key={condicao.id || index}
                  className="flex items-center gap-2 text-xs p-1 bg-purple-50 dark:bg-purple-900/20 rounded border"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }}
                  />
                  <span className="truncate flex-1" title={condicao.label}>
                    {condicao.label.length > 20 ? `${condicao.label.substring(0, 20)}...` : condicao.label}
                  </span>
                </div>
              ))}
              {condicoes.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{condicoes.length - 3} mais...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <SimpleNodeActions
        nodeId={id}
        nodeType="specialConditions"
        onDelete={data?.onDelete}
        show={selected}
      />

      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />

      {/* Handles de saída para cada condição especial */}
      {condicoes.map((condicao, index) => {
        const totalCondicoes = condicoes.length;
        const nodeHeight = 144; // altura aproximada do nó
        const handleSpacing = Math.min(32, nodeHeight / (totalCondicoes + 1));
        const startY = -(nodeHeight / 2) + (handleSpacing * 2);
        const offsetY = startY + (index * handleSpacing);
        
        return (
          <React.Fragment key={condicao.id || index}>
            <Handle
              type="source"
              position={Position.Right}
              id={`special-condition-${index}`}
              className="!w-3.5 !h-3.5 !border-2 !border-white !shadow-md !right-0 !transform !translate-x-1/2"
              style={{
                top: `calc(50% + ${offsetY}px)`,
                backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)`,
                zIndex: 10,
              }}
            />
            
            {/* Tooltip para identificar a condição */}
            <div
              className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black dark:bg-none dark:bg-[#0E0E0E] text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{
                right: '-10px',
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(100%, -50%)',
              }}
            >
              {condicao.label}
            </div>
          </React.Fragment>
        );
      })}
      
      {/* Handle padrão se não há condições */}
      {condicaoCount === 0 && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2" 
        />
      )}
    </div>
  );
};

export default SpecialConditionsNode;