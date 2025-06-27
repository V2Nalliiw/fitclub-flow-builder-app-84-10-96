
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
      <div className={`w-40 h-32 rounded-[15px] bg-white border shadow-sm transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200'
      }`}>
        {isConfigured ? (
          <>
            <Database className="h-6 w-6 mb-1 text-[#5D8701]" />
            <div className="text-xs font-semibold text-center text-[#5D8701] tracking-tight mb-1">
              Form. Selecionado
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <CheckCircle className="h-2.5 w-2.5" />
              <span>Configurado</span>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-6 w-6 mb-1 text-[#5D8701]" />
            <div className="text-xs font-semibold text-center text-[#5D8701] tracking-tight mb-1">
              Formulário
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <FileText className="h-2.5 w-2.5" />
              <span>Não configurado</span>
            </div>
          </>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !left-0 !transform !-translate-x-1/2 !-translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#5D8701] border-2 border-white shadow-md !right-0 !transform !translate-x-1/2 !-translate-y-1/2"
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
