
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useFlowProcessor } from './useFlowProcessor';
import { useWhatsApp } from './useWhatsApp';
import { useWhatsAppSettings } from './useWhatsAppSettings';
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
  const { sendWhatsAppTemplateMessage, sendMessage } = useWhatsApp();
  const { getWhatsAppConfig } = useWhatsAppSettings();

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
      console.log('🚀 executeFirstNode: Iniciando execução para:', executionId);
      
      // Encontrar o primeiro nó (start)
      const startNode = nodes.find(node => node.type === 'start');
      if (!startNode) {
        console.log('❌ executeFirstNode: Nenhum nó de início encontrado');
        return;
      }

      console.log('✅ executeFirstNode: Nó de início encontrado:', startNode);

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
        console.error('❌ executeFirstNode: Erro ao atualizar execução:', updateError);
        return;
      }

      // Buscar dados da execução para processamento
      const { data: execution, error: execError } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (execError || !execution) {
        console.error('❌ executeFirstNode: Erro ao buscar execução:', execError);
        return;
      }

      console.log('📋 executeFirstNode: Dados da execução:', execution);

      // Verificar se é uma execução de paciente e enviar WhatsApp
      if (execution.patient_id) {
        console.log('📱 executeFirstNode: Enviando template inicial para paciente:', execution.patient_id);
        
        try {
          // Buscar dados do paciente
          const { data: patient, error: patientError } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('user_id', execution.patient_id)
            .single();

          if (patientError || !patient || !patient.phone) {
            console.error('❌ executeFirstNode: Paciente sem telefone:', patientError);
            return;
          }

          console.log('👤 executeFirstNode: Dados do paciente:', { name: patient.name, phone: patient.phone });

          // Tentar enviar template oficial primeiro, depois fallback
          const sendTemplateWithFallback = async () => {
            console.log('🎯 executeFirstNode: Tentando template oficial "envio_formulario"');
            
            try {
              // Importar o whatsappService para usar templates oficiais Meta
              const { whatsappService } = await import('@/services/whatsapp/WhatsAppService');
              
              // Verificar se temos configuração ativa
              const config = getWhatsAppConfig();
              if (!config || !config.is_active) {
                console.log('⚠️ executeFirstNode: WhatsApp não configurado');
                return;
              }

              whatsappService.setConfig(config);

              // Usar URL fixa do FitClub para o dashboard do paciente
              const patientDashboardUrl = 'https://fitclub.app.br/dashboard';
              
              console.log('🌐 executeFirstNode: URL do dashboard:', patientDashboardUrl);

              // Tentar template oficial primeiro
              let result = await whatsappService.sendTemplate(
                patient.phone,
                'novo_formulario',
                [patient.name || 'Paciente', patientDashboardUrl]
              );

              console.log('📊 executeFirstNode: Resultado template oficial:', result);

              // Se template oficial falhou, tentar template básico
              if (!result.success) {
                console.log('🔄 executeFirstNode: Template oficial falhou, tentando template básico');
                result = await sendWhatsAppTemplateMessage(
                  patient.phone,
                  'novo_formulario',
                  {
                    form_name: execution.flow_name || 'Fluxo',
                    patient_name: patient.name || 'Paciente',
                    form_url: patientDashboardUrl
                  }
                );
                console.log('📊 executeFirstNode: Resultado template básico:', result);
              }

              // Se todos os templates falharam, usar mensagem simples
              if (!result.success) {
                console.log('📝 executeFirstNode: Templates falharam, usando mensagem simples');
                const fallbackMessage = `🚀 *Novo Fluxo Iniciado*\n\nOlá ${patient.name || 'Paciente'}! Um novo fluxo "${execution.flow_name || 'Fluxo'}" foi iniciado para você.\n\n📱 Acesse: https://fitclub.app.br/dashboard`;
                result = await sendMessage(patient.phone, fallbackMessage);
                console.log('📊 executeFirstNode: Resultado mensagem simples:', result);
              }

              if (result.success) {
                console.log('✅ executeFirstNode: Template de início enviado com sucesso');
              } else {
                console.error('❌ executeFirstNode: Falha em todos os métodos de envio:', result.error);
              }

            } catch (error) {
              console.error('❌ executeFirstNode: Erro no envio de template:', error);
            }
          };

          // Executar envio sem await para não bloquear
          sendTemplateWithFallback();

        } catch (error) {
          console.error('❌ executeFirstNode: Erro geral:', error);
        }
      }

    } catch (error) {
      console.error('❌ executeFirstNode: Erro crítico:', error);
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
