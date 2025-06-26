
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUpload } from '@/components/ui/file-upload';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface FormField {
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

interface DynamicFormProps {
  formId: string;
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formId,
  title,
  description,
  fields,
  onSubmit,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.id];
      
      if (field.required && (!value || value === '')) {
        newErrors[field.id] = 'Este campo é obrigatório';
      }
      
      if (field.validation) {
        if (field.validation.min && value && value.length < field.validation.min) {
          newErrors[field.id] = `Mínimo ${field.validation.min} caracteres`;
        }
        if (field.validation.max && value && value.length > field.validation.max) {
          newErrors[field.id] = `Máximo ${field.validation.max} caracteres`;
        }
        if (field.validation.pattern && value && !new RegExp(field.validation.pattern).test(value)) {
          newErrors[field.id] = 'Formato inválido';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      value: formData[field.id] || '',
      onChange: (e: any) => handleFieldChange(field.id, e.target?.value || e),
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <Input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select value={formData[field.id]} onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={formData[field.id]}
            onValueChange={(value) => handleFieldChange(field.id, value)}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={formData[field.id]?.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[field.id] || [];
                    if (checked) {
                      handleFieldChange(field.id, [...currentValues, option]);
                    } else {
                      handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <FileUpload
            onFilesChange={(files) => handleFieldChange(field.id, files)}
            maxFiles={1}
            className="mt-2"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id}>
              <div className="space-y-2">
                <Label htmlFor={field.id} className="flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-sm text-red-500">{errors[field.id]}</p>
                )}
              </div>
              {index < fields.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Enviando...' : 'Enviar Formulário'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
