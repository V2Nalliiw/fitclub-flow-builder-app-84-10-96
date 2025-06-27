
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
    name: string;
    description?: string;
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

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['flow-assignments', user?.id],
    queryFn: async (): Promise<FlowAssignment[]> => {
      if (!user) return [];

      let query = supabase
        .from('flow_assignments')
        .select(`
          *,
          flows!inner(name, description),
          patient:profiles!flow_assignments_patient_id_fkey(name, email),
          assigned_by_profile:profiles!flow_assignments_assigned_by_fkey(name)
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
          const patientIds = clinicPatients.map(p => p.user_id);
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

      return (data || []).map(assignment => ({
        ...assignment,
        flow: assignment.flows,
        patient: assignment.patient,
        assigned_by_profile: assignment.assigned_by_profile,
      }));
    },
    enabled: !!user,
  });

  const assignFlowMutation = useMutation({
    mutationFn: async ({ flowId, patientId, notes }: { flowId: string; patientId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-assignments'] });
      toast.success('Fluxo atribuído com sucesso!');
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

  return {
    assignments,
    isLoading,
    assignFlow: assignFlowMutation.mutate,
    updateAssignmentStatus: updateAssignmentStatusMutation.mutate,
    isAssigning: assignFlowMutation.isPending,
    isUpdating: updateAssignmentStatusMutation.isPending,
  };
};
