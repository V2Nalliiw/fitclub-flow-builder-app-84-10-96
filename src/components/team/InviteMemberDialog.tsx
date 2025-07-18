import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus } from 'lucide-react';
import { CreateInvitationData } from '@/hooks/useTeamManagement';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: CreateInvitationData) => Promise<void>;
  roleLabels: Record<string, string>;
  permissionLabels: Record<string, string>;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onOpenChange,
  onInvite,
  roleLabels,
  permissionLabels
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInvitationData>({
    email: '',
    name: '',
    role: 'viewer',
    permissions: {},
    whatsapp_phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onInvite(formData);
      setFormData({
        email: '',
        name: '',
        role: 'viewer',
        permissions: {},
        whatsapp_phone: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Convidar Novo Membro</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="joao@clinica.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Cargo *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as CreateInvitationData['role'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permissões Específicas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione as permissões específicas para este membro. Os cargos Admin e Manager têm acesso total automaticamente.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions?.[permission] || false}
                      onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                      disabled={formData.role === 'admin' || formData.role === 'manager'}
                    />
                    <Label 
                      htmlFor={permission} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {(formData.role === 'admin' || formData.role === 'manager') && (
                <p className="text-xs text-muted-foreground mt-4">
                  Este cargo tem acesso total a todas as funcionalidades.
                </p>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};