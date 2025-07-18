import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { CreateInvitationData } from '@/hooks/useTeamManagement';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: CreateInvitationData) => Promise<void>;
  roleLabels: Record<string, string>;
  permissionLabels: Record<string, string>;
}

export const InviteMemberDialog = ({ 
  open, 
  onOpenChange, 
  onInvite, 
  roleLabels,
  permissionLabels 
}: InviteMemberDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateInvitationData>();

  const watchedRole = watch('role');

  const onSubmit = async (data: CreateInvitationData) => {
    try {
      setLoading(true);
      await onInvite(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Digite o nome completo"
              {...register('name', { 
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o email"
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_phone">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp_phone"
              placeholder="Ex: +5511999999999"
              {...register('whatsapp_phone')}
            />
            <p className="text-xs text-muted-foreground">
              Formato: +55 + DDD + número (apenas números)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Select 
              onValueChange={(value) => setValue('role', value as any)}
              defaultValue="viewer"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {watchedRole && (
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Permissões do Cargo</h4>
              <p className="text-xs text-muted-foreground">
                {watchedRole === 'admin' && 'Acesso total ao sistema, incluindo gerenciamento de equipe e configurações.'}
                {watchedRole === 'manager' && 'Gerenciamento de pacientes, fluxos e análises. Acesso limitado às configurações.'}
                {watchedRole === 'professional' && 'Gerenciamento de pacientes e execução de fluxos. Acesso às suas próprias atividades.'}
                {watchedRole === 'assistant' && 'Suporte na execução de atividades e acesso limitado aos dados dos pacientes.'}
                {watchedRole === 'viewer' && 'Apenas visualização de dados. Não pode fazer alterações no sistema.'}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};