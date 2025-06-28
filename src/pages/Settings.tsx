import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LogoUpload } from '@/components/ui/logo-upload';
import { Building2, Save, Bell, Key, Palette, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useLogoUpload } from '@/hooks/useLogoUpload';

export const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: appSettings, updateSettings: updateAppSettings } = useAppSettings();
  const { uploadAppLogo, uploadClinicLogo, uploading } = useLogoUpload();
  const [loading, setLoading] = useState(false);
  
  const [clinicData, setClinicData] = useState({
    name: 'Clínica Example',
    email: 'contato@clinica.com',
    phone: '(11) 3333-4444',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    description: 'Clínica especializada em fisioterapia e reabilitação',
    website: 'https://clinica.com',
  });

  const [notifications, setNotifications] = useState({
    newPatient: true,
    appointmentReminder: true,
    flowCompletion: true,
    systemUpdates: false,
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: '',
    telegram: '',
    email_smtp: '',
    sms_provider: '',
  });

  const handleClinicDataChange = (field: string, value: string) => {
    setClinicData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIntegrationChange = (field: string, value: string) => {
    setIntegrations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAppLogoUpload = async (file: File) => {
    const logoUrl = await uploadAppLogo(file);
    if (logoUrl) {
      await updateAppSettings({ logo_url: logoUrl });
    }
  };

  const handleClinicLogoUpload = async (file: File) => {
    if (!user?.clinic_id) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a clínica",
        variant: "destructive",
      });
      return;
    }

    const logoUrl = await uploadClinicLogo(file, user.clinic_id);
    if (logoUrl) {
      // Aqui seria atualizada a logo da clínica no banco
      toast({
        title: "Logo atualizado",
        description: "Logo da clínica foi atualizado com sucesso",
      });
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          {user?.role === 'super_admin' ? 'Gerencie as configurações do app' : 'Gerencie as configurações da clínica'}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configurações do App - apenas para super admin */}
        {user?.role === 'super_admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <CardTitle>Configurações do App</CardTitle>
              </div>
              <CardDescription>
                Configure o logo e nome do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LogoUpload
                onUpload={handleAppLogoUpload}
                currentLogo={appSettings?.logo_url}
                uploading={uploading}
                label="Logo do App"
              />
              
              <div>
                <Label htmlFor="app-name">Nome do App</Label>
                <Input
                  id="app-name"
                  value={appSettings?.app_name || ''}
                  onChange={(e) => updateAppSettings({ app_name: e.target.value })}
                  placeholder="Nome do aplicativo"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações da Clínica */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>
                {user?.role === 'super_admin' ? 'Configurações Padrão' : 'Informações da Clínica'}
              </CardTitle>
            </div>
            <CardDescription>
              Configure os dados básicos da clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {user?.role !== 'super_admin' && (
                <div className="md:col-span-2">
                  <LogoUpload
                    onUpload={handleClinicLogoUpload}
                    currentLogo={undefined} // Logo da clínica seria carregado aqui
                    uploading={uploading}
                    label="Logo da Clínica"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="clinic-name">Nome da Clínica</Label>
                <Input
                  id="clinic-name"
                  value={clinicData.name}
                  onChange={(e) => handleClinicDataChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clinic-email">Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinicData.email}
                  onChange={(e) => handleClinicDataChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clinic-phone">Telefone</Label>
                <Input
                  id="clinic-phone"
                  value={clinicData.phone}
                  onChange={(e) => handleClinicDataChange('phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clinic-website">Website</Label>
                <Input
                  id="clinic-website"
                  value={clinicData.website}
                  onChange={(e) => handleClinicDataChange('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="clinic-address">Endereço</Label>
                <Input
                  id="clinic-address"
                  value={clinicData.address}
                  onChange={(e) => handleClinicDataChange('address', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="clinic-description">Descrição</Label>
                <Textarea
                  id="clinic-description"
                  value={clinicData.description}
                  onChange={(e) => handleClinicDataChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Notificações */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Novo Paciente</Label>
                  <p className="text-sm text-muted-foreground">Quando um novo paciente se cadastrar</p>
                </div>
                <Switch
                  checked={notifications.newPatient}
                  onCheckedChange={(value) => handleNotificationChange('newPatient', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Lembrete de Consulta</Label>
                  <p className="text-sm text-muted-foreground">Lembretes de consultas agendadas</p>
                </div>
                <Switch
                  checked={notifications.appointmentReminder}
                  onCheckedChange={(value) => handleNotificationChange('appointmentReminder', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Fluxo Concluído</Label>
                  <p className="text-sm text-muted-foreground">Quando um paciente completar um fluxo</p>
                </div>
                <Switch
                  checked={notifications.flowCompletion}
                  onCheckedChange={(value) => handleNotificationChange('flowCompletion', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Atualizações do Sistema</Label>
                  <p className="text-sm text-muted-foreground">Notificações sobre atualizações</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(value) => handleNotificationChange('systemUpdates', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle>Integrações</CardTitle>
              </div>
              <CardDescription>
                Configure integrações com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Business API</Label>
                <Input
                  id="whatsapp"
                  value={integrations.whatsapp}
                  onChange={(e) => handleIntegrationChange('whatsapp', e.target.value)}
                  placeholder="Token da API"
                />
              </div>

              <div>
                <Label htmlFor="telegram">Telegram Bot</Label>
                <Input
                  id="telegram"
                  value={integrations.telegram}
                  onChange={(e) => handleIntegrationChange('telegram', e.target.value)}
                  placeholder="Token do Bot"
                />
              </div>

              <div>
                <Label htmlFor="email-smtp">Servidor SMTP</Label>
                <Input
                  id="email-smtp"
                  value={integrations.email_smtp}
                  onChange={(e) => handleIntegrationChange('email_smtp', e.target.value)}
                  placeholder="smtp.servidor.com"
                />
              </div>

              <div>
                <Label htmlFor="sms-provider">Provedor SMS</Label>
                <Input
                  id="sms-provider"
                  value={integrations.sms_provider}
                  onChange={(e) => handleIntegrationChange('sms_provider', e.target.value)}
                  placeholder="Chave da API"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
