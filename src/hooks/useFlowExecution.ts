
import { useState, useCallback } from 'react';
import { FlowNode, FlowExecution, FormResponse } from '@/types/flow';

export const useFlowExecution = () => {
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);

  const startFlowExecution = useCallback(async (
    flowId: string,
    pacienteId: string,
    nodes: FlowNode[]
  ) => {
    // Encontra o nó de início
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('Fluxo deve ter um nó de início');
    }

    const execution: FlowExecution = {
      id: `exec_${Date.now()}`,
      flow_id: flowId,
      paciente_id: pacienteId,
      status: 'em-andamento',
      no_atual: startNode.id,
      started_at: new Date().toISOString(),
    };

    setExecutions(prev => [...prev, execution]);
    
    // Aqui integraria com Supabase para salvar a execução
    console.log('Iniciando execução do fluxo:', execution);
    
    return execution;
  }, []);

  const processNode = useCallback(async (
    executionId: string,
    nodeId: string,
    nodeType: string,
    nodeData: any
  ) => {
    console.log(`Processando nó ${nodeType}:`, { executionId, nodeId, nodeData });

    switch (nodeType) {
      case 'formStart':
        // Envia WhatsApp com link do formulário
        await sendWhatsAppMessage(executionId, {
          type: 'form_link',
          titulo: nodeData.titulo,
          descricao: nodeData.descricao,
          link: `https://app.fitclub.com/formulario/${executionId}/${nodeId}`,
        });
        break;

      case 'formEnd':
        // Envia conteúdo após resposta do formulário
        await sendWhatsAppMessage(executionId, {
          type: 'content',
          mensagem: nodeData.mensagemFinal,
          arquivo: nodeData.arquivo,
          tipoConteudo: nodeData.tipoConteudo,
        });
        break;

      case 'delay':
        // Agenda próxima execução
        await scheduleNextNode(executionId, nodeData.quantidade, nodeData.tipoIntervalo);
        break;

      case 'question':
        // Salva pergunta e aguarda resposta
        await saveQuestionNode(executionId, nodeId, nodeData);
        break;

      case 'end':
        // Finaliza fluxo
        await finalizeExecution(executionId, nodeData.mensagemFinal);
        break;
    }
  }, []);

  const saveFormResponse = useCallback(async (
    executionId: string,
    nodeId: string,
    pacienteId: string,
    resposta: any
  ) => {
    const response: FormResponse = {
      id: `resp_${Date.now()}`,
      execution_id: executionId,
      node_id: nodeId,
      paciente_id: pacienteId,
      resposta,
      created_at: new Date().toISOString(),
    };

    setResponses(prev => [...prev, response]);
    
    // Aqui integraria com Supabase para salvar a resposta
    console.log('Salvando resposta:', response);
    
    return response;
  }, []);

  // Funções auxiliares (implementar com integrações reais)
  const sendWhatsAppMessage = async (executionId: string, messageData: any) => {
    console.log('Enviando WhatsApp:', { executionId, messageData });
    // Integração com API do WhatsApp via Supabase Edge Function
  };

  const scheduleNextNode = async (executionId: string, quantidade: number, tipo: string) => {
    console.log('Agendando próximo nó:', { executionId, quantidade, tipo });
    // Implementar sistema de agendamento
  };

  const saveQuestionNode = async (executionId: string, nodeId: string, questionData: any) => {
    console.log('Salvando pergunta:', { executionId, nodeId, questionData });
    // Salvar pergunta no banco para posterior resposta
  };

  const finalizeExecution = async (executionId: string, mensagemFinal?: string) => {
    setExecutions(prev => 
      prev.map(exec => 
        exec.id === executionId 
          ? { ...exec, status: 'concluido', completed_at: new Date().toISOString() }
          : exec
      )
    );
    
    if (mensagemFinal) {
      await sendWhatsAppMessage(executionId, {
        type: 'final_message',
        mensagem: mensagemFinal,
      });
    }
    
    console.log('Finalizando execução:', executionId);
  };

  return {
    executions,
    responses,
    startFlowExecution,
    processNode,
    saveFormResponse,
  };
};
