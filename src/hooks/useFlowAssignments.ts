
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useFlowProcessor } from './useFlowProcessor';
import { FlowNode, FlowEdge } from '@/types/flow';

export interface FlowAssignment {
  id: string;
  flow_id: string;
  patient_id: string;
  assigned_by: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  flow?: {
    id: string;
    name: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
    is_active?: boolean;
  };
  patient?: {
    name: string;
    email: string;
  };
  assigned_by_profile?: {
    name: string;
  };
}

export const useFlowAssignments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { processFlowAssignment } = useFlowProcessor();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['flow-assignments', user?.id],
    queryFn: async (): Promise<FlowAssignment[]> => {
      if (!user) return [];

      try {
        console.log('Buscando atribuições para usuário:', user.role, user.id);

        let query = supabase
          .from('flow_assignments')
          .select(`
            *,
            flows!inner(
              id,
              name, 
              description,
              nodes,
              edges,
              is_active
            )
          `)
          .order('assigned_at', { ascending: false });

        // Filter based on user role
        if (user.role === 'patient') {
          query = query.eq('patient_id', user.id);
        } else if (user.role === 'clinic') {
          // For clinics, get assignments for patients in their clinic
          const { data: clinicPatients } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('clinic_id', user.clinic_id)
            .eq('role', 'patient');

          if (clinicPatients && clinicPatients.length > 0) {
            const patientIds = clinicPatients.map((p: any) => p.user_id);
            query = query.in('patient_id', patientIds);
          } else {
            return [];
          }
        }
        // Super admin gets all assignments (no filter needed)

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar atribuições:', error);
          throw error;
        }

        console.log('Atribuições encontradas:', data);

        return (data || []).map((assignment: any) => ({
          ...assignment,
          flow: assignment.flows,
          patient: { name: 'Patient', email: 'patient@example.com' }, // Placeholder
          assigned_by_profile: { name: 'Assigned By' }, // Placeholder
        }));
      } catch (error) {
        console.error('Erro na consulta de atribuições:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const startFlowExecution = useMutation({
    mutationFn: async ({ assignmentId, flowId }: { assignmentId: string; flowId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Iniciando execução do fluxo:', { assignmentId, flowId, userId: user.id });

      // Update assignment status to 'started'
      const { error: updateError } = await supabase
        .from('flow_assignments')
        .update({
          status: 'started',
          started_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('Erro ao atualizar status da atribuição:', updateError);
        throw updateError;
      }

      // Get flow data with nodes and edges
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        console.error('Erro ao buscar fluxo:', flowError);
        throw new Error('Fluxo não encontrado');
      }

      // Safely parse nodes and edges from Json to proper types
      const nodes: FlowNode[] = Array.isArray(flow.nodes) ? (flow.nodes as unknown as FlowNode[]) : [];
      const edges: FlowEdge[] = Array.isArray(flow.edges) ? (flow.edges as unknown as FlowEdge[]) : [];

      // Process flow to create proper execution with steps
      const execution = await processFlowAssignment(
        flowId,
        user.id,
        nodes,
        edges
      );

      console.log('Execução criada:', execution);

      // Executar automaticamente o primeiro nó
      await executeFirstNode(execution.id, nodes);

      return execution;
    },
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ['flow-assignments'] });
      toast.success('Fluxo iniciado com sucesso!');
      if (execution?.id) {
        navigate(`/flow-execution/${execution.id}`);
      }
    },
    onError: (error: any) => {
      console.error('Erro ao iniciar fluxo:', error);
      toast.error('Erro ao iniciar fluxo: ' + error.message);
    },
  });

  const assignFlowMutation = useMutation({
    mutationFn: async ({ flowId, patientId, notes }: { flowId: string; patientId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Criar a atribuição
      const { data: assignment, error } = await supabase
        .from('flow_assignments')
        .insert({
          flow_id: flowId,
          patient_id: patientId,
          assigned_by: user.id,
          notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao atribuir fluxo:', error);
        throw error;
      }

      // Buscar dados do fluxo
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        console.error('Erro ao buscar fluxo:', flowError);
        throw new Error('Fluxo não encontrado');
      }

      // Processar fluxo automaticamente para o paciente
      const nodes: FlowNode[] = Array.isArray(flow.nodes) ? (flow.nodes as unknown as FlowNode[]) : [];
      const edges: FlowEdge[] = Array.isArray(flow.edges) ? (flow.edges as unknown as FlowEdge[]) : [];

      console.log('Auto-iniciando execução do fluxo para o paciente:', patientId);
      
      const execution = await processFlowAssignment(
        flowId,
        patientId,
        nodes,
        edges
      );

      console.log('Execução criada automaticamente:', execution);

      // Executar automaticamente o primeiro nó
      await executeFirstNode(execution.id, nodes);

      return { assignment, execution };
    },
    onSuccess: ({ assignment, execution }) => {
      queryClient.invalidateQueries({ queryKey: ['flow-assignments'] });
      toast.success('Fluxo atribuído e iniciado automaticamente!');
      console.log('Fluxo atribuído e processado:', { assignment, execution });
    },
    onError: (error: any) => {
      console.error('Erro ao atribuir fluxo:', error);
      toast.error('Erro ao atribuir fluxo: ' + error.message);
    },
  });

  const updateAssignmentStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status, notes }: { assignmentId: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      
      if (status === 'started') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('flow_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-assignments'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const executeFirstNode = async (executionId: string, nodes: FlowNode[]) => {
    try {
      console.log('🚀 Executando primeiro nó para execução:', executionId);
      
      // Encontrar o primeiro nó (start)
      const startNode = nodes.find(node => node.type === 'start');
      if (!startNode) {
        console.log('❌ Nenhum nó de início encontrado');
        return;
      }

      console.log('✅ Nó de início encontrado:', startNode);

      // Atualizar status da execução
      const { error: updateError } = await supabase
        .from('flow_executions')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString(),
          current_node: startNode.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (updateError) {
        console.error('❌ Erro ao atualizar execução:', updateError);
        return;
      }

      // Buscar dados da execução para processamento
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        console.error('❌ Erro ao buscar execução:', execError);
        return;
      }

      console.log('📋 Dados da execução:', execution);

      // Verificar se é uma execução de paciente e disparar processo de envio
      if (execution.patient_id) {
        console.log('📱 Disparando processo de WhatsApp para paciente:', execution.patient_id);
        
        // Chamar edge function para iniciar o processo
        try {
          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-patient-invitation', {
            body: {
              executionId: executionId,
              type: 'flow_start',
              flowName: execution.flow_name
            }
          });

          if (whatsappError) {
            console.error('❌ Erro ao disparar WhatsApp:', whatsappError);
          } else {
            console.log('✅ WhatsApp disparado com sucesso:', whatsappResult);
          }
        } catch (error) {
          console.error('❌ Erro na chamada da edge function:', error);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao executar primeiro nó:', error);
    }
  };


  return {
    assignments,
    isLoading,
    assignFlow: assignFlowMutation.mutate,
    updateAssignmentStatus: updateAssignmentStatusMutation.mutate,
    startFlowExecution: startFlowExecution.mutate,
    isAssigning: assignFlowMutation.isPending,
    isUpdating: updateAssignmentStatusMutation.isPending,
    isStarting: startFlowExecution.isPending,
  };
};
