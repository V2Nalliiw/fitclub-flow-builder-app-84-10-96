
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'number' | 'email' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SavedForm {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  responses: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const useFormManager = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState<SavedForm[]>([
    {
      id: '1',
      name: 'Avaliação Inicial',
      description: 'Formulário para primeira consulta',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Nome Completo',
          placeholder: 'Digite seu nome',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'seu@email.com',
          required: true
        },
        {
          id: 'pain_level',
          type: 'select',
          label: 'Nível de Dor (0-10)',
          options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          required: true
        }
      ],
      responses: 23,
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const saveForm = useCallback((formData: Omit<SavedForm, 'id' | 'responses' | 'createdAt' | 'updatedAt'>) => {
    const newForm: SavedForm = {
      ...formData,
      id: `form_${Date.now()}`,
      responses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setForms(prev => [...prev, newForm]);
    
    toast({
      title: "Formulário salvo",
      description: `"${formData.name}" foi salvo com sucesso.`,
    });

    return newForm;
  }, [toast]);

  const updateForm = useCallback((formId: string, formData: Partial<SavedForm>) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, ...formData, updatedAt: new Date().toISOString() }
        : form
    ));
    
    toast({
      title: "Formulário atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  }, [toast]);

  const deleteForm = useCallback((formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    
    toast({
      title: "Formulário excluído",
      description: "O formulário foi removido permanentemente.",
      variant: "destructive",
    });
  }, [toast]);

  const duplicateForm = useCallback((formId: string) => {
    const formToDuplicate = forms.find(f => f.id === formId);
    if (!formToDuplicate) return;

    const duplicated: SavedForm = {
      ...formToDuplicate,
      id: `form_${Date.now()}`,
      name: `${formToDuplicate.name} (Cópia)`,
      responses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setForms(prev => [...prev, duplicated]);
    
    toast({
      title: "Formulário duplicado",
      description: `"${duplicated.name}" foi criado com sucesso.`,
    });

    return duplicated;
  }, [forms, toast]);

  return {
    forms,
    saveForm,
    updateForm,
    deleteForm,
    duplicateForm,
  };
};
