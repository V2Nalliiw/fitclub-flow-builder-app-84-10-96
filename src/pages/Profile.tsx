
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { PatientWhatsAppConfig } from '@/components/patients/PatientWhatsAppConfig';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Lock, User, Save, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const handleWhatsAppUpdate = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      phone: phone
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Informações Pessoais */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                <CardTitle className="text-lg md:text-xl">Informações Pessoais</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Atualize suas informações básicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AvatarUpload
                  currentAvatar={user?.avatar_url}
                  userName={user?.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">Foto do Perfil</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Clique na imagem para alterar sua foto de perfil
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm md:text-base">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm md:text-base">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={loading} 
                className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Configuração do WhatsApp */}
          <PatientWhatsAppConfig 
            initialPhone={formData.phone}
            onPhoneUpdate={handleWhatsAppUpdate}
          />
        </div>

        {/* Segurança e Notificações */}
        <div className="space-y-4 md:space-y-6">
          {/* Alterar Senha */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
                <CardTitle className="text-lg md:text-xl">Segurança</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-sm md:text-base">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="text-sm md:text-base">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm md:text-base">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={loading} 
                className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white min-h-[44px]"
              >
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Preferências de Notificação */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <CardTitle className="text-lg md:text-xl">Notificações</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Configure como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 min-w-0 pr-4">
                  <Label className="text-sm md:text-base">Email</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Receber notificações por email</p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={(value) => handleNotificationChange('email', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="flex-1 min-w-0 pr-4">
                  <Label className="text-sm md:text-base">Push</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Notificações push no navegador</p>
                </div>
                <Switch
                  checked={formData.notifications.push}
                  onCheckedChange={(value) => handleNotificationChange('push', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="flex-1 min-w-0 pr-4">
                  <Label className="text-sm md:text-base">WhatsApp</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Receber formulários via WhatsApp</p>
                </div>
                <Switch
                  checked={!!formData.phone}
                  disabled={!formData.phone}
                  onCheckedChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
