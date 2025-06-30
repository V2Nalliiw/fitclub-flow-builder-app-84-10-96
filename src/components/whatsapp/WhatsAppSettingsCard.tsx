
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, CheckCircle, AlertCircle, TestTube, Save, Info, Crown } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { WhatsAppSettings as WhatsAppSettingsType } from '@/hooks/useWhatsAppSettings';
import { useAuth } from '@/contexts/AuthContext';

interface WhatsAppSettingsCardProps {
  compact?: boolean;
  showTitle?: boolean;
}

export const WhatsAppSettingsCard = ({ compact = false, showTitle = true }: WhatsAppSettingsCardProps) => {
  const { user } = useAuth();
  const { isConnected, isLoading, testConnection } = useWhatsApp();
  const { settings, saveSettings } = useWhatsAppSettings();
  const [formConfig, setFormConfig] = useState<Partial<WhatsAppSettingsType>>({
    provider: 'evolution',
    is_active: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormConfig(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveSettings(formConfig);
    if (success) {
      setTimeout(() => {
        testConnection();
      }, 1000);
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    await testConnection();
  };

  const isGlobalSettings = user?.role === 'super_admin';
  const isUsingGlobalConfig = !settings?.clinic_id && user?.role !== 'super_admin';

  return (
    <Card>
      <CardHeader>
        {showTitle && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isGlobalSettings && <Crown className="h-5 w-5 text-yellow-500" />}
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp API
                {isGlobalSettings && <span className="text-sm text-muted-foreground">(Global)</span>}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
              {isUsingGlobalConfig && (
                <Badge variant="outline">
                  <Crown className="h-3 w-3 mr-1" />
                  Usando API Global
                </Badge>
              )}
            </div>
          </div>
        )}
        <CardDescription>
          {isGlobalSettings 
            ? 'Configure as credenciais globais do WhatsApp para todas as clínicas'
            : isUsingGlobalConfig
            ? 'Sua clínica está usando as configurações globais. Configure suas próprias credenciais ou continue usando as globais.'
            : 'Configure sua API do WhatsApp para envio automático'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUsingGlobalConfig && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Usando configurações globais:</strong> Sua clínica está usando as configurações de WhatsApp padrão do sistema. 
              Você pode configurar suas próprias credenciais abaixo ou continuar usando as globais.
            </AlertDescription>
          </Alert>
        )}

        {isGlobalSettings && (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Configurações Globais:</strong> Estas configurações serão aplicadas como padrão para todas as clínicas 
              que não tiverem suas próprias configurações específicas.
            </AlertDescription>
          </Alert>
        )}

        {/* Campo de Ativação */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="space-y-1">
            <Label htmlFor="is_active" className="text-base font-medium">
              Ativar WhatsApp
            </Label>
            <p className="text-sm text-muted-foreground">
              {formConfig.is_active ? 'WhatsApp está ativo' : 'WhatsApp está inativo'}
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formConfig.is_active || false}
            onCheckedChange={(checked) => 
              setFormConfig({ ...formConfig, is_active: checked })
            }
          />
        </div>

        <div>
          <Label htmlFor="provider">Provedor de API</Label>
          <Select
            value={formConfig.provider}
            onValueChange={(value: 'evolution' | 'twilio' | 'meta') => 
              setFormConfig({ ...formConfig, provider: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o provedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="evolution">Evolution API (Recomendado)</SelectItem>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="meta">Meta Official API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formConfig.provider === 'evolution' && (
          <>
            <div>
              <Label htmlFor="baseUrl">URL Base da API *</Label>
              <Input
                id="baseUrl"
                value={formConfig.base_url || ''}
                onChange={(e) => setFormConfig({ ...formConfig, base_url: e.target.value })}
                placeholder="https://evolution.suaapi.com"
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={formConfig.api_key || ''}
                onChange={(e) => setFormConfig({ ...formConfig, api_key: e.target.value })}
                placeholder="Sua chave da API"
              />
            </div>
            <div>
              <Label htmlFor="sessionName">Nome da Sessão *</Label>
              <Input
                id="sessionName"
                value={formConfig.session_name || ''}
                onChange={(e) => setFormConfig({ ...formConfig, session_name: e.target.value })}
                placeholder="minha-sessao-whatsapp"
              />
            </div>
          </>
        )}

        {formConfig.provider === 'meta' && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Para usar a Meta API oficial, você precisa de uma conta comercial aprovada no Facebook Business.
              </AlertDescription>
            </Alert>
            
            <div>
              <Label htmlFor="accessToken">Access Token *</Label>
              <Input
                id="accessToken"
                type="password"
                value={formConfig.access_token || ''}
                onChange={(e) => setFormConfig({ ...formConfig, access_token: e.target.value })}
                placeholder="EAAjSGnSrm3E... (Token da Meta API)"
              />
            </div>
            
            <div>
              <Label htmlFor="businessAccountId">Business Account ID *</Label>
              <Input
                id="businessAccountId"
                value={formConfig.business_account_id || ''}
                onChange={(e) => setFormConfig({ ...formConfig, business_account_id: e.target.value })}
                placeholder="123456789012345"
              />
            </div>
            
            <div>
              <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
              <Input
                id="phoneNumberId"
                value={formConfig.phone_number || ''}
                onChange={(e) => setFormConfig({ ...formConfig, phone_number: e.target.value })}
                placeholder="123456789012345"
              />
            </div>
          </>
        )}

        {formConfig.provider === 'twilio' && (
          <>
            <div>
              <Label htmlFor="accountSid">Account SID *</Label>
              <Input
                id="accountSid"
                value={formConfig.account_sid || ''}
                onChange={(e) => setFormConfig({ ...formConfig, account_sid: e.target.value })}
                placeholder="Seu Account SID do Twilio"
              />
            </div>
            <div>
              <Label htmlFor="authToken">Auth Token *</Label>
              <Input
                id="authToken"
                type="password"
                value={formConfig.auth_token || ''}
                onChange={(e) => setFormConfig({ ...formConfig, auth_token: e.target.value })}
                placeholder="Seu Auth Token"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Número WhatsApp *</Label>
              <Input
                id="phoneNumber"
                value={formConfig.phone_number || ''}
                onChange={(e) => setFormConfig({ ...formConfig, phone_number: e.target.value })}
                placeholder="whatsapp:+5511999999999"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={isLoading}>
            <TestTube className="h-4 w-4 mr-2" />
            Testar
          </Button>
        </div>

        {/* Status Info */}
        {!compact && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provedor:</span>
              <span className="font-medium capitalize">{formConfig.provider || 'Não configurado'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Configuração:</span>
              <span className="font-medium">
                {isGlobalSettings ? 'Global' : isUsingGlobalConfig ? 'Herdada (Global)' : 'Própria'}
              </span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              ✅ WhatsApp conectado com sucesso! Os formulários serão enviados automaticamente.
            </p>
          </div>
        )}

        {!formConfig.is_active && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              ❌ WhatsApp está inativo. Ative o WhatsApp para começar a usar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
