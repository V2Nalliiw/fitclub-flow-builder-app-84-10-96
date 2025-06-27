
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, Database, AlertCircle, CheckCircle } from 'lucide-react';
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

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-105' : ''
    }`}>
      <div className={`w-40 h-20 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 relative overflow-hidden ${
        selected 
          ? 'border-[#5D8701] shadow-[0_0_0_2px_rgba(93,135,1,0.2)]' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-2 px-3 py-2">
          <FileText className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Formulário</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600"></div>
        
        {/* Content Section */}
        <div className="px-3 py-2">
          {isConfigured ? (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-3 w-3" />
              <span>Configurado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-3 w-3" />
              <span>Não configurado</span>
            </div>
          )}
        </div>
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
