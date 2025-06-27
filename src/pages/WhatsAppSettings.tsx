
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, CheckCircle, AlertCircle, TestTube, Save } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { WhatsAppSettings as WhatsAppSettingsType } from '@/hooks/useWhatsAppSettings';

export const WhatsAppSettings = () => {
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
    await saveSettings(formConfig);
    setIsSaving(false);
  };

  const handleTest = async () => {
    await testConnection();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações WhatsApp</h1>
          <p className="text-muted-foreground">Configure a integração para envio automático de formulários</p>
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuração Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Configuração de Conexão
            </CardTitle>
            <CardDescription>
              Configure sua API do WhatsApp para envio automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Separator />

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
          </CardContent>
        </Card>

        {/* Status e Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              Informações sobre sua conexão WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={isConnected ? 'default' : 'secondary'}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Provedor:</span>
                <span className="text-sm font-medium capitalize">{formConfig.provider || 'Não configurado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessão:</span>
                <span className="text-sm font-medium">{formConfig.session_name || 'Não configurada'}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Como configurar:</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Escolha seu provedor de API WhatsApp</li>
                <li>Insira suas credenciais de acesso</li>
                <li>Teste a conexão</li>
                <li>Salve as configurações</li>
              </ol>
            </div>

            {isConnected && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">
                  ✅ WhatsApp conectado com sucesso! Os formulários agora serão enviados automaticamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
