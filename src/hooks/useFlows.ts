
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

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
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const { data: flows = [], isLoading, error } = useQuery({
    queryKey: ['flows', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('Nenhum usuário autenticado');
        return [];
      }

      console.log('Buscando fluxos para usuário:', user.role, user.id);

      try {
        let query = supabase.from('flows').select('*');

        // Aplicar filtros baseados no papel do usuário
        if (user.role === 'clinic') {
          query = query.eq('clinic_id', user.clinic_id);
        } else if (user.role === 'patient') {
          // Para pacientes, buscar apenas fluxos atribuídos
          const { data: assignments } = await supabase
            .from('flow_assignments')
            .select('flow_id')
            .eq('patient_id', user.id);
          
          if (assignments && assignments.length > 0) {
            const flowIds = assignments.map(a => a.flow_id);
            query = query.in('id', flowIds);
          } else {
            console.log('Nenhum fluxo atribuído ao paciente');
            setHasLoadedOnce(true);
            setIsEmpty(true);
            return [];
          }
        }
        // Super admin vê todos os fluxos (sem filtro adicional)

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar fluxos:', error);
          throw error;
        }
        
        console.log('Fluxos carregados:', data?.length || 0);
        setHasLoadedOnce(true);
        setIsEmpty(!data || data.length === 0);
        return data as Flow[];
      } catch (error) {
        console.error('Erro na consulta de fluxos:', error);
        setHasLoadedOnce(true);
        setIsEmpty(true);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false, // Desabilitar retry para evitar loops
  });

  // Função para refresh manual
  const refreshFlows = useCallback(() => {
    setHasLoadedOnce(false);
    setIsEmpty(false);
    queryClient.invalidateQueries({ queryKey: ['flows'] });
  }, [queryClient]);

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

      if (error) {
        console.error('Erro ao criar fluxo:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      setHasLoadedOnce(false);
      setIsEmpty(false);
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
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar fluxo:', error);
        throw error;
      }
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

      if (error) {
        console.error('Erro ao excluir fluxo:', error);
        throw error;
      }
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

  const saveFlowFromBuilder = async (flowData: { name: string; description?: string; nodes: any[]; edges: any[] }) => {
    if (!user) throw new Error('User not authenticated');
    
    return createFlowMutation.mutateAsync(flowData);
  };

  const updateFlowFromBuilder = async (id: string, flowData: { name: string; description?: string; nodes: any[]; edges: any[] }) => {
    return updateFlowMutation.mutateAsync({ id, ...flowData });
  };

  return {
    flows,
    isLoading: isLoading && !hasLoadedOnce,
    error,
    hasLoadedOnce,
    isEmpty,
    refreshFlows,
    createFlow: createFlowMutation.mutate,
    updateFlow: updateFlowMutation.mutate,
    deleteFlow: deleteFlowMutation.mutate,
    saveFlowFromBuilder,
    updateFlowFromBuilder,
    isCreating: createFlowMutation.isPending,
    isUpdating: updateFlowMutation.isPending,
    isDeleting: deleteFlowMutation.isPending,
  };
};
