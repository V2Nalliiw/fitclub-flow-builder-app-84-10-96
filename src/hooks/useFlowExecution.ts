
import { useState, useCallback } from 'react';
import { FlowNode } from '@/types/flow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFlowExecution = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const startFlowExecution = useCallback(async (
    flowId: string,
    patientId: string,
    nodes: FlowNode[]
  ) => {
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('Fluxo deve ter um nó de início');
    }

    try {
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('name')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      const { data: execution, error: executionError } = await supabase
        .from('flow_executions')
        .insert({
          flow_id: flowId,
          flow_name: flow.name,
          patient_id: patientId,
          status: 'em-andamento',
          current_node: startNode.id,
          progress: 0,
          total_steps: nodes.length,
          completed_steps: 0,
          current_step: {
            id: startNode.id,
            type: startNode.type,
            title: startNode.data.label || 'Início',
            description: startNode.data.descricao,
            completed: false,
          },
        })
        .select()
        .single();

      if (executionError) {
        console.error('Erro ao criar execução:', executionError);
        throw executionError;
      }

      console.log('Execução do fluxo iniciada:', execution);
      return execution;

    } catch (error) {
      console.error('Erro ao iniciar execução:', error);
      toast({
        title: "Erro ao iniciar fluxo",
        description: "Não foi possível iniciar o fluxo",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const processNode = useCallback(async (
    executionId: string,
    nodeId: string,
    nodeType: string,
    nodeData: any
  ) => {
    setProcessing(true);
    
    try {
      console.log(`Processando nó ${nodeType}:`, { executionId, nodeId, nodeData });

      switch (nodeType) {
        case 'formStart':
          await supabase.from('flow_steps').insert({
            execution_id: executionId,
            node_id: nodeId,
            node_type: nodeType,
            title: nodeData.titulo || 'Formulário',
            description: nodeData.descricao,
            status: 'disponivel',
            form_url: `${window.location.origin}/forms/${nodeId}?execution=${executionId}`,
          });
          
          console.log('Etapa de formulário criada');
          break;

        case 'formEnd':
          console.log('Processando fim de formulário:', nodeData);
          break;

        case 'delay':
          const delay = nodeData.quantidade || 1;
          const tipo = nodeData.tipoIntervalo || 'dias';
          
          let nextDate = new Date();
          switch (tipo) {
            case 'minutos':
              nextDate.setMinutes(nextDate.getMinutes() + delay);
              break;
            case 'horas':
              nextDate.setHours(nextDate.getHours() + delay);
              break;
            case 'dias':
            default:
              nextDate.setDate(nextDate.getDate() + delay);
              break;
          }

          await supabase
            .from('flow_executions')
            .update({
              status: 'aguardando',
              next_step_available_at: nextDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', executionId);

          console.log('Delay processado, próxima execução em:', nextDate);
          break;

        case 'question':
          await supabase.from('flow_steps').insert({
            execution_id: executionId,
            node_id: nodeId,
            node_type: nodeType,
            title: nodeData.pergunta || 'Pergunta',
            description: 'Responda a pergunta para continuar',
            status: 'disponivel',
          });
          
          console.log('Etapa de pergunta criada');
          break;

        case 'end':
          await supabase
            .from('flow_executions')
            .update({
              status: 'concluido',
              progress: 100,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', executionId);
          
          console.log('Fluxo finalizado');
          break;

        default:
          console.log('Tipo de nó não reconhecido:', nodeType);
      }

    } catch (error) {
      console.error('Erro ao processar nó:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar a etapa do fluxo",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const saveFormResponse = useCallback(async (
    executionId: string,
    nodeId: string,
    patientId: string,
    response: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .insert({
          execution_id: executionId,
          node_id: nodeId,
          patient_id: patientId,
          response: response,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar resposta:', error);
        throw error;
      }

      console.log('Resposta salva:', data);
      return data;

    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast({
        title: "Erro ao salvar resposta",
        description: "Não foi possível salvar a resposta",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    processing,
    startFlowExecution,
    processNode,
    saveFormResponse,
  };
};
