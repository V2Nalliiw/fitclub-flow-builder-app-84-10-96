
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Mail,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Preferences = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    // Configurações Gerais
    systemName: 'FitClub System',
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/MM/yyyy',
    
    // Notificações
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
    
    // Segurança
    sessionTimeout: '30',
    passwordMinLength: '8',
    requirePasswordChange: true,
    passwordChangeInterval: '90',
    twoFactorAuth: false,
    
    // Backup e Manutenção
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30',
    maintenanceWindow: '02:00',
    
    // Integrações
    allowApiAccess: true,
    maxApiRequests: '1000',
    webhookUrl: '',
    
    // Logs e Auditoria
    logLevel: 'info',
    auditLogging: true,
    logRetention: '90',
    
    // Configurações de Email
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@fitclub.com',
    
    // Limites do Sistema
    maxUsersPerClinic: '100',
    maxFlowsPerClinic: '50',
    maxStoragePerClinic: '5',
  });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Preferências salvas",
        description: "As configurações do sistema foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Conexão testada",
        description: "Email de teste enviado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao servidor SMTP.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferências do Sistema</h1>
        <p className="text-muted-foreground">Configure as preferências globais do sistema</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Configurações Gerais</CardTitle>
            </div>
            <CardDescription>
              Configurações básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="system-name">Nome do Sistema</Label>
              <Input
                id="system-name"
                value={preferences.systemName}
                onChange={(e) => handleInputChange('systemName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="default-language">Idioma Padrão</Label>
              <Select
                value={preferences.defaultLanguage}
                onValueChange={(value) => handleInputChange('defaultLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-format">Formato de Data</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => handleInputChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
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
              Configure como o sistema enviará notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Enviar alertas por email</p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(value) => handleInputChange('emailNotifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações SMS</Label>
                  <p className="text-sm text-muted-foreground">Enviar alertas por SMS</p>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(value) => handleInputChange('smsNotifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificações push</p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(value) => handleInputChange('pushNotifications', value)}
                />
              </div>

              <div>
                <Label htmlFor="notification-frequency">Frequência</Label>
                <Select
                  value={preferences.notificationFrequency}
                  onValueChange={(value) => handleInputChange('notificationFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Imediato</SelectItem>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Configurações de segurança e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={preferences.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password-min-length">Tamanho Mínimo da Senha</Label>
              <Input
                id="password-min-length"
                type="number"
                value={preferences.passwordMinLength}
                onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Exigir Troca de Senha</Label>
                <p className="text-sm text-muted-foreground">Forçar troca periódica</p>
              </div>
              <Switch
                checked={preferences.requirePasswordChange}
                onCheckedChange={(value) => handleInputChange('requirePasswordChange', value)}
              />
            </div>

            <div>
              <Label htmlFor="password-change-interval">Intervalo de Troca (dias)</Label>
              <Input
                id="password-change-interval"
                type="number"
                value={preferences.passwordChangeInterval}
                onChange={(e) => handleInputChange('passwordChangeInterval', e.target.value)}
                disabled={!preferences.requirePasswordChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">Exigir 2FA para todos</p>
              </div>
              <Switch
                checked={preferences.twoFactorAuth}
                onCheckedChange={(value) => handleInputChange('twoFactorAuth', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Configurações de Email</CardTitle>
            </div>
            <CardDescription>
              Configure o servidor SMTP para envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="smtp-server">Servidor SMTP</Label>
                <Input
                  id="smtp-server"
                  value={preferences.smtpServer}
                  onChange={(e) => handleInputChange('smtpServer', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="smtp-port">Porta SMTP</Label>
                <Input
                  id="smtp-port"
                  value={preferences.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                  placeholder="587"
                />
              </div>

              <div>
                <Label htmlFor="smtp-username">Usuário SMTP</Label>
                <Input
                  id="smtp-username"
                  value={preferences.smtpUsername}
                  onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                  placeholder="seu-email@gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="smtp-password">Senha SMTP</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={preferences.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="from-email">Email Remetente</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={preferences.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="noreply@fitclub.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={testEmailConnection}>
                Testar Conexão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Limites do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Limites do Sistema</CardTitle>
            </div>
            <CardDescription>
              Configure limites de uso para clínicas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="max-users">Máximo de Usuários por Clínica</Label>
              <Input
                id="max-users"
                type="number"
                value={preferences.maxUsersPerClinic}
                onChange={(e) => handleInputChange('maxUsersPerClinic', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max-flows">Máximo de Fluxos por Clínica</Label>
              <Input
                id="max-flows"
                type="number"
                value={preferences.maxFlowsPerClinic}
                onChange={(e) => handleInputChange('maxFlowsPerClinic', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max-storage">Armazenamento por Clínica (GB)</Label>
              <Input
                id="max-storage"
                type="number"
                value={preferences.maxStoragePerClinic}
                onChange={(e) => handleInputChange('maxStoragePerClinic', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
};
