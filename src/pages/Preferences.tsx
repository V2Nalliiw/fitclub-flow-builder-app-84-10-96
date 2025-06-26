
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Shield, Database, Bell, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Preferences = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    // Sistema
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h',
    
    // Segurança
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    
    // Base de Dados
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: '30',
    
    // Notificações Globais
    systemMaintenance: true,
    securityAlerts: true,
    newUserRegistration: true,
    systemUpdates: false,
    
    // Email
    smtpServer: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Sistema FitClub',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
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
        description: "Todas as configurações foram atualizadas com sucesso.",
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferências do Sistema</h1>
        <p className="text-muted-foreground">Configure as preferências globais do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Configurações Gerais</CardTitle>
            </div>
            <CardDescription>
              Configure idioma, fuso horário e formatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select value={preferences.language} onValueChange={(value) => handleInputChange('language', value)}>
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
              <Select value={preferences.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-format">Formato de Data</Label>
              <Select value={preferences.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time-format">Formato de Hora</Label>
              <Select value={preferences.timeFormat} onValueChange={(value) => handleInputChange('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
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
              Configure políticas de segurança do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">Obrigar 2FA para todos os usuários</p>
              </div>
              <Switch
                checked={preferences.twoFactorAuth}
                onCheckedChange={(value) => handleInputChange('twoFactorAuth', value)}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
              <Input
                id="session-timeout"
                value={preferences.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="password-expiry">Expiração de Senha (dias)</Label>
              <Input
                id="password-expiry"
                value={preferences.passwordExpiry}
                onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                placeholder="90"
              />
            </div>

            <div>
              <Label htmlFor="login-attempts">Máximo de Tentativas de Login</Label>
              <Input
                id="login-attempts"
                value={preferences.loginAttempts}
                onChange={(e) => handleInputChange('loginAttempts', e.target.value)}
                placeholder="5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Base de Dados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Base de Dados</CardTitle>
            </div>
            <CardDescription>
              Configure backup e manutenção da base de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Executar backups automáticos</p>
              </div>
              <Switch
                checked={preferences.autoBackup}
                onCheckedChange={(value) => handleInputChange('autoBackup', value)}
              />
            </div>

            <div>
              <Label htmlFor="backup-frequency">Frequência do Backup</Label>
              <Select value={preferences.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="retention-days">Retenção de Backups (dias)</Label>
              <Input
                id="retention-days"
                value={preferences.retentionDays}
                onChange={(e) => handleInputChange('retentionDays', e.target.value)}
                placeholder="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações do Sistema</CardTitle>
            </div>
            <CardDescription>
              Configure notificações globais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Manutenção do Sistema</Label>
                <p className="text-sm text-muted-foreground">Alertas de manutenção programada</p>
              </div>
              <Switch
                checked={preferences.systemMaintenance}
                onCheckedChange={(value) => handleInputChange('systemMaintenance', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">Notificações de segurança críticas</p>
              </div>
              <Switch
                checked={preferences.securityAlerts}
                onCheckedChange={(value) => handleInputChange('securityAlerts', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Novos Usuários</Label>
                <p className="text-sm text-muted-foreground">Notificar sobre novos registros</p>
              </div>
              <Switch
                checked={preferences.newUserRegistration}
                onCheckedChange={(value) => handleInputChange('newUserRegistration', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Atualizações do Sistema</Label>
                <p className="text-sm text-muted-foreground">Notificações sobre atualizações</p>
              </div>
              <Switch
                checked={preferences.systemUpdates}
                onCheckedChange={(value) => handleInputChange('systemUpdates', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configurações de Email</CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  placeholder="usuario@gmail.com"
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

              <div>
                <Label htmlFor="from-email">Email Remetente</Label>
                <Input
                  id="from-email"
                  value={preferences.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="noreply@fitclub.com"
                />
              </div>

              <div>
                <Label htmlFor="from-name">Nome Remetente</Label>
                <Input
                  id="from-name"
                  value={preferences.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Sistema FitClub"
                />
              </div>
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
