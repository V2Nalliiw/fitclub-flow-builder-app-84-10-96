
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, ExternalLink, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { NodeActions } from '../NodeActions';
import { useFormIntegration } from '../../hooks/useFormIntegration';

interface FormSelectNodeData extends Record<string, unknown> {
  label: string;
  formId?: string;
  formName?: string;
  formTitle?: string;
  formDescription?: string;
  autoSend?: boolean;
  sendToWhatsApp?: boolean;
  whatsAppMessage?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const FormSelectNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected 
}) => {
  const nodeData = data as FormSelectNodeData;
  const { getFormById, generateFormUrl, getExecutionResult } = useFormIntegration();
  
  const form = nodeData.formId ? getFormById(nodeData.formId) : null;
  const executionResult = getExecutionResult(id);
  const isConfigured = !!(nodeData.formId && form);

  const handlePreviewForm = () => {
    if (nodeData.formId) {
      const formUrl = generateFormUrl(nodeData.formId);
      if (formUrl) {
        window.open(formUrl, '_blank');
      }
    }
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-40 h-32 rounded-lg bg-gradient-to-br ${
        isConfigured 
          ? 'from-indigo-500/70 to-indigo-600/70' 
          : 'from-orange-400/70 to-orange-500/70'
      } backdrop-blur-sm shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden border ${
        isConfigured ? 'border-indigo-500/20' : 'border-orange-500/20'
      } ${
        selected 
          ? `shadow-[0_0_0_3px_${isConfigured ? 'rgba(99,102,241,0.3)' : 'rgba(251,146,60,0.3)'},0_8px_25px_${isConfigured ? 'rgba(99,102,241,0.2)' : 'rgba(251,146,60,0.2)'}]` 
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      }`}>
        {/* Glow effect interno */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10" />
        
        {/* Padrão de seleção no fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-3 gap-1 p-2 h-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`bg-white/20 rounded ${i === 4 ? 'bg-white/40' : ''}`}></div>
            ))}
          </div>
        </div>
        
        {isConfigured ? (
          <>
            <Database className="h-6 w-6 mb-1 relative z-10" />
            <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
              Form. Selecionado
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10">
              <CheckCircle className="h-2.5 w-2.5" />
              <span>Configurado</span>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-6 w-6 mb-1 relative z-10" />
            <div className="text-xs font-semibold text-center relative z-10 tracking-tight mb-1">
              Formulário
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-90 relative z-10">
              <FileText className="h-2.5 w-2.5" />
              <span>Não configurado</span>
            </div>
          </>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3.5 h-3.5 ${isConfigured ? 'bg-indigo-500' : 'bg-orange-500'} border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3.5 h-3.5 ${isConfigured ? 'bg-indigo-500' : 'bg-orange-500'} border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2`}
      />
      
      <NodeActions
        nodeId={id}
        nodeType="formSelect"
        onDelete={nodeData.onDelete}
        onDuplicate={nodeData.onDuplicate}
        visible={selected}
      />
    </div>
  );
};
