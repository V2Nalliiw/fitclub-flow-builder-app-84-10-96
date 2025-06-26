
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export const FormField = ({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  description
}: FormFieldProps) => {
  const error = form.formState.errors[name];
  const value = form.watch(name);

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name}
        className={cn(
          "text-sm font-medium",
          required && "after:content-['*'] after:text-destructive after:ml-1",
          error && "text-destructive"
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <InputComponent
          id={name}
          type={type === 'textarea' ? undefined : type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "transition-colors",
            error && "border-destructive focus-visible:ring-destructive",
            value && "border-primary/50"
          )}
          {...form.register(name)}
        />
        
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
};

export default FormField;
