import { useState, useCallback, useEffect } from 'react';
import { whatsappTemplateService } from '@/services/whatsapp/WhatsAppTemplateService';
import { WhatsAppTemplate, TemplateVariables } from '@/types/whatsapp-template';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWhatsAppTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!user?.clinic_id) return;
    
    setLoading(true);
    try {
      const data = await whatsappTemplateService.listTemplates(user.clinic_id);
      setTemplates(data);
    } catch (error: any) {
      console.error('useWhatsAppTemplates: Erro ao carregar templates:', error);
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.clinic_id, toast]);

  const renderTemplate = useCallback(async (
    templateName: string, 
    variables: TemplateVariables
  ): Promise<string> => {
    try {
      return await whatsappTemplateService.renderTemplate(
        templateName, 
        variables, 
        user?.clinic_id
      );
    } catch (error: any) {
      console.error('useWhatsAppTemplates: Erro ao renderizar template:', error);
      toast({
        title: "Erro ao processar template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.clinic_id, toast]);

  const createTemplate = useCallback(async (
    template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    try {
      const newTemplate = await whatsappTemplateService.createTemplate({
        ...template,
        clinic_id: user?.clinic_id
      });
      
      setTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template criado",
        description: `Template "${template.name}" foi criado com sucesso`,
      });
      
      return newTemplate;
    } catch (error: any) {
      console.error('useWhatsAppTemplates: Erro ao criar template:', error);
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.clinic_id, toast]);

  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<WhatsAppTemplate>
  ) => {
    setLoading(true);
    try {
      const updatedTemplate = await whatsappTemplateService.updateTemplate(id, updates);
      
      setTemplates(prev => 
        prev.map(t => t.id === id ? updatedTemplate : t)
      );
      
      toast({
        title: "Template atualizado",
        description: "Template foi atualizado com sucesso",
      });
      
      return updatedTemplate;
    } catch (error: any) {
      console.error('useWhatsAppTemplates: Erro ao atualizar template:', error);
      toast({
        title: "Erro ao atualizar template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await whatsappTemplateService.deleteTemplate(id);
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Template removido",
        description: "Template foi removido com sucesso",
      });
    } catch (error: any) {
      console.error('useWhatsAppTemplates: Erro ao deletar template:', error);
      toast({
        title: "Erro ao remover template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    loadTemplates,
    renderTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};