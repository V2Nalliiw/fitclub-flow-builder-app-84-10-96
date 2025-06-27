
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flow, FlowNode, FlowEdge } from '@/types/flow';

export const useClinicFlows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClinicFlows = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar fluxos da clínica:', error);
        toast({
          title: "Erro ao carregar fluxos",
          description: "Não foi possível carregar os fluxos da clínica",
          variant: "destructive",
        });
        return;
      }

      const transformedFlows: Flow[] = (data || []).map(flow => ({
        id: flow.id,
        nome: flow.name,
        descricao: flow.description || undefined,
        clinica_id: flow.clinic_id || '',
        nodes: flow.nodes as FlowNode[],
        edges: flow.edges as FlowEdge[],
        ativo: flow.is_active,
        created_at: flow.created_at,
      }));

      setFlows(transformedFlows);

    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os fluxos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const saveFlow = useCallback(async (flowData: {
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    is_active?: boolean;
  }) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('flows')
        .insert({
          name: flowData.name,
          description: flowData.description,
          clinic_id: user.clinic_id,
          created_by: user.id,
          nodes: flowData.nodes,
          edges: flowData.edges,
          is_active: flowData.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar fluxo:', error);
        toast({
          title: "Erro ao salvar fluxo",
          description: "Não foi possível salvar o fluxo",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Fluxo salvo",
        description: "O fluxo foi salvo com sucesso",
      });

      // Recarregar fluxos
      await loadClinicFlows();

      return data;

    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao salvar o fluxo",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, loadClinicFlows]);

  const updateFlow = useCallback(async (flowId: string, updates: Partial<{
    name: string;
    description: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    is_active: boolean;
  }>) => {
    try {
      const { error } = await supabase
        .from('flows')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flowId)
        .eq('created_by', user?.id);

      if (error) {
        console.error('Erro ao atualizar fluxo:', error);
        toast({
          title: "Erro ao atualizar fluxo",
          description: "Não foi possível atualizar o fluxo",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Fluxo atualizado",
        description: "O fluxo foi atualizado com sucesso",
      });

      // Recarregar fluxos
      await loadClinicFlows();
      return true;

    } catch (error) {
      console.error('Erro ao atualizar fluxo:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao atualizar o fluxo",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, loadClinicFlows]);

  const deleteFlow = useCallback(async (flowId: string) => {
    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId)
        .eq('created_by', user?.id);

      if (error) {
        console.error('Erro ao deletar fluxo:', error);
        toast({
          title: "Erro ao deletar fluxo",
          description: "Não foi possível deletar o fluxo",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Fluxo deletado",
        description: "O fluxo foi deletado com sucesso",
      });

      // Recarregar fluxos
      await loadClinicFlows();
      return true;

    } catch (error) {
      console.error('Erro ao deletar fluxo:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao deletar o fluxo",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, loadClinicFlows]);

  const startFlowExecution = useCallback(async (flowId: string, patientId: string) => {
    try {
      // Buscar o fluxo para obter informações
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        throw new Error('Fluxo não encontrado');
      }

      const nodes = flow.nodes as FlowNode[];
      const startNode = nodes.find(node => node.type === 'start');
      
      if (!startNode) {
        throw new Error('Fluxo deve ter um nó de início');
      }

      // Criar execução
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
        throw executionError;
      }

      toast({
        title: "Fluxo iniciado",
        description: "O fluxo foi iniciado para o paciente",
      });

      return execution;

    } catch (error) {
      console.error('Erro ao iniciar execução do fluxo:', error);
      toast({
        title: "Erro ao iniciar fluxo",
        description: "Não foi possível iniciar o fluxo para o paciente",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    flows,
    loading,
    loadClinicFlows,
    saveFlow,
    updateFlow,
    deleteFlow,
    startFlowExecution,
  };
};
