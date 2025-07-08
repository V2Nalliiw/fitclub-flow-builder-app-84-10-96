import { supabase } from '@/integrations/supabase/client';
import { WhatsAppTemplate, TemplateVariables } from '@/types/whatsapp-template';

class WhatsAppTemplateService {
  async getTemplate(name: string, clinicId?: string): Promise<WhatsAppTemplate | null> {
    console.log('WhatsAppTemplateService: Buscando template:', name, 'para clínica:', clinicId);
    
    try {
      // Primeiro tenta buscar template específico da clínica
      if (clinicId) {
        const { data: clinicTemplate, error: clinicError } = await supabase
          .from('whatsapp_templates')
          .select('*')
          .eq('name', name)
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .single();

        if (!clinicError && clinicTemplate) {
          console.log('WhatsAppTemplateService: Template da clínica encontrado:', clinicTemplate);
          return clinicTemplate;
        }
      }

      // Se não encontrou template da clínica, busca template global
      const { data: globalTemplate, error: globalError } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('name', name)
        .is('clinic_id', null)
        .eq('is_active', true)
        .single();

      if (globalError) {
        console.error('WhatsAppTemplateService: Erro ao buscar template global:', globalError);
        return null;
      }

      console.log('WhatsAppTemplateService: Template global encontrado:', globalTemplate);
      return globalTemplate;
    } catch (error) {
      console.error('WhatsAppTemplateService: Erro inesperado ao buscar template:', error);
      return null;
    }
  }

  async renderTemplate(templateName: string, variables: TemplateVariables, clinicId?: string): Promise<string> {
    console.log('WhatsAppTemplateService: Renderizando template:', templateName, 'com variáveis:', variables);
    
    const template = await this.getTemplate(templateName, clinicId);
    
    if (!template) {
      console.warn('WhatsAppTemplateService: Template não encontrado, usando fallback');
      return this.getFallbackTemplate(templateName, variables);
    }

    let content = template.content;

    // Substituir placeholders pelas variáveis
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    // Verificar se restaram placeholders não substituídos
    const remainingPlaceholders = content.match(/\{[^}]+\}/g);
    if (remainingPlaceholders) {
      console.warn('WhatsAppTemplateService: Placeholders não substituídos:', remainingPlaceholders);
    }

    console.log('WhatsAppTemplateService: Template renderizado:', content);
    return content;
  }

  private getFallbackTemplate(templateName: string, variables: TemplateVariables): string {
    console.log('WhatsAppTemplateService: Usando template fallback para:', templateName);
    
    switch (templateName) {
      case 'codigo_verificacao':
        return `🔐 *Código de Verificação*\n\nSeu código de verificação é: *${variables.code || '______'}*\n\nEste código expira em ${variables.expiry_time || '5 minutos'}.\n\n_Não compartilhe este código com ninguém._`;
      
      case 'envio_formulario':
        return `📋 *${variables.form_name || 'Formulário'}*\n\nOlá${variables.patient_name ? ` ${variables.patient_name}` : ''}! Você tem um formulário para preencher.\n\n🔗 Acesse o link: ${variables.form_url || '#'}\n\n_Responda assim que possível._`;
      
      case 'mensagem_geral':
        return `💬 *Mensagem${variables.clinic_name ? ` de ${variables.clinic_name}` : ''}*\n\n${variables.message || ''}\n\n_Atenciosamente${variables.clinic_name ? `, ${variables.clinic_name}` : ''}_`;
      
      default:
        return variables.message || 'Mensagem não disponível';
    }
  }

  async createTemplate(template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppTemplate> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      console.error('WhatsAppTemplateService: Erro ao criar template:', error);
      throw new Error(`Erro ao criar template: ${error.message}`);
    }

    return data;
  }

  async updateTemplate(id: string, updates: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('WhatsAppTemplateService: Erro ao atualizar template:', error);
      throw new Error(`Erro ao atualizar template: ${error.message}`);
    }

    return data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('WhatsAppTemplateService: Erro ao deletar template:', error);
      throw new Error(`Erro ao deletar template: ${error.message}`);
    }
  }

  async listTemplates(clinicId?: string): Promise<WhatsAppTemplate[]> {
    const query = supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (clinicId) {
      // Busca templates da clínica e globais
      const { data, error } = await query.or(`clinic_id.eq.${clinicId},clinic_id.is.null`);
      
      if (error) {
        console.error('WhatsAppTemplateService: Erro ao listar templates:', error);
        throw new Error(`Erro ao listar templates: ${error.message}`);
      }

      return data || [];
    } else {
      // Busca apenas templates globais
      const { data, error } = await query.is('clinic_id', null);
      
      if (error) {
        console.error('WhatsAppTemplateService: Erro ao listar templates globais:', error);
        throw new Error(`Erro ao listar templates: ${error.message}`);
      }

      return data || [];
    }
  }
}

export const whatsappTemplateService = new WhatsAppTemplateService();