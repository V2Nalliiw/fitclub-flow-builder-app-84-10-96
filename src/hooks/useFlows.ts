
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  is_active: boolean;
  created_by: string;
  clinic_id?: string;
  created_at: string;
  updated_at: string;
}

export const useFlows = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['flows', user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase.from('flows').select('*');

      // Filtrar baseado no papel do usuário
      if (user.role === 'clinic') {
        query = query.eq('created_by', user.id);
      } else if (user.role === 'super_admin') {
        // Super admin vê todos os fluxos
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Flow[];
    },
    enabled: !!user,
  });

  const createFlowMutation = useMutation({
    mutationFn: async (flowData: Partial<Flow>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flows')
        .insert([{
          name: flowData.name,
          description: flowData.description,
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
          is_active: flowData.is_active ?? true,
          created_by: user.id,
          clinic_id: user.clinic_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Fluxo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar fluxo:', error);
      toast.error('Erro ao criar fluxo. Tente novamente.');
    },
  });

  const updateFlowMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Flow> & { id: string }) => {
      const { data, error } = await supabase
        .from('flows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Fluxo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar fluxo:', error);
      toast.error('Erro ao atualizar fluxo. Tente novamente.');
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Fluxo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir fluxo:', error);
      toast.error('Erro ao excluir fluxo. Tente novamente.');
    },
  });

  return {
    flows,
    isLoading,
    createFlow: createFlowMutation.mutate,
    updateFlow: updateFlowMutation.mutate,
    deleteFlow: deleteFlowMutation.mutate,
    isCreating: createFlowMutation.isPending,
    isUpdating: updateFlowMutation.isPending,
    isDeleting: deleteFlowMutation.isPending,
  };
};
