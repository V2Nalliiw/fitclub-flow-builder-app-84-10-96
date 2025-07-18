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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { CreateInvitationData, CreateUserData } from '@/hooks/useTeamManagement';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: CreateInvitationData) => Promise<void>;
  onCreateUser: (data: CreateUserData) => Promise<void>;
  roleLabels: Record<string, string>;
  permissionLabels: Record<string, string>;
}

export const InviteMemberDialog = ({ 
  open, 
  onOpenChange, 
  onInvite, 
  onCreateUser,
  roleLabels,
  permissionLabels 
}: InviteMemberDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [createDirectly, setCreateDirectly] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<any>();

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setValue('temporaryPassword', password);
  };

  const watchedRole = watch('role');

  const onSubmit = async (data: CreateInvitationData | CreateUserData) => {
    try {
      setLoading(true);
      if (createDirectly) {
        await onCreateUser(data as CreateUserData);
      } else {
        await onInvite(data as CreateInvitationData);
      }
      reset();
      setGeneratedPassword('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setGeneratedPassword('');
    setCreateDirectly(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {createDirectly ? 'Criar Novo Usuário' : 'Convidar Novo Membro'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Toggle entre convite e criação direta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Modo de Adição</CardTitle>
              <CardDescription>
                Escolha como adicionar o novo membro à equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {createDirectly ? 'Criar usuário diretamente' : 'Enviar convite por email'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {createDirectly 
                      ? 'Cria conta imediatamente com senha provisória'
                      : 'Usuário deve aceitar convite e criar própria conta'
                    }
                  </p>
                </div>
                <Switch
                  checked={createDirectly}
                  onCheckedChange={setCreateDirectly}
                />
              </div>
            </CardContent>
          </Card>

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
              <p className="text-sm text-destructive">{String(errors.name?.message || '')}</p>
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
              <p className="text-sm text-destructive">{String(errors.email?.message || '')}</p>
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

            {/* Campo de senha para criação direta */}
            {createDirectly && (
              <div className="space-y-2">
                <Label htmlFor="temporaryPassword">Senha Provisória</Label>
                <div className="flex gap-2">
                  <Input
                    id="temporaryPassword"
                    type="text"
                    placeholder="Senha gerada automaticamente"
                    value={generatedPassword}
                    {...register('temporaryPassword', { 
                      required: createDirectly ? 'Senha é obrigatória' : false 
                    })}
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    className="whitespace-nowrap"
                  >
                    Gerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O usuário deve trocar a senha no primeiro login
                </p>
                {errors.temporaryPassword && (
                  <p className="text-sm text-destructive">{String(errors.temporaryPassword?.message || '')}</p>
                )}
              </div>
            )}

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
              <p className="text-sm text-destructive">{String(errors.role?.message || '')}</p>
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
              {loading 
                ? (createDirectly ? 'Criando...' : 'Enviando...') 
                : (createDirectly ? 'Criar Usuário' : 'Enviar Convite')
              }
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};