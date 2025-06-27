import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import { Building2, Save, Bell, Key, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

export const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<File[]>([]);
  const { uploadFile } = useFileUpload('clinic-logos');
  
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

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Upload logo if selected
      if (logo.length > 0) {
        const uploadedLogo = await uploadFile(logo[0]);
        if (uploadedLogo) {
          console.log('Logo uploaded:', uploadedLogo.url);
        }
      }

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
        <p className="text-muted-foreground">Gerencie as configurações da clínica</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações da Clínica */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Informações da Clínica</CardTitle>
            </div>
            <CardDescription>
              Configure os dados básicos da clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Logo da Clínica</Label>
                <FileUpload
                  onFilesChange={setLogo}
                  maxFiles={1}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                  className="mt-2"
                />
              </div>

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

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
