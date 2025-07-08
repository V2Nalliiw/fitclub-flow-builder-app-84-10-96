export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  clinic_id?: string;
  is_active: boolean;
  is_official: boolean;
  placeholders: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVariables {
  [key: string]: string;
}

export interface WhatsAppTemplateService {
  getTemplate(name: string, clinicId?: string): Promise<WhatsAppTemplate | null>;
  renderTemplate(templateName: string, variables: TemplateVariables, clinicId?: string): Promise<string>;
  createTemplate(template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppTemplate>;
  updateTemplate(id: string, updates: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate>;
  deleteTemplate(id: string): Promise<void>;
  listTemplates(clinicId?: string): Promise<WhatsAppTemplate[]>;
}