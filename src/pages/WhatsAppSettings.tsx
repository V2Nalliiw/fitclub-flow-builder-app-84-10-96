
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, CheckCircle, AlertCircle, TestTube, Save, Info, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { WhatsAppSettings as WhatsAppSettingsType } from '@/hooks/useWhatsAppSettings';
import { useAuth } from '@/contexts/AuthContext';

export const WhatsAppSettings = () => {
  const { user } = useAuth();
  const { isConnected, isLoading, testConnection } = useWhatsApp();
  const { settings, saveSettings } = useWhatsAppSettings();
  const [formConfig, setFormConfig] = useState<Partial<WhatsAppSettingsType>>({
    provider: 'evolution',
    is_active: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('WhatsAppSettings: Settings carregadas:', settings);
    if (settings) {
      setFormConfig(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    console.log('WhatsAppSettings: Salvando configurações:', formConfig);
    setIsSaving(true);
    const success = await saveSettings(formConfig);
    if (success) {
      // Test connection after saving
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {isGlobalSettings && <Crown className="h-8 w-8 text-yellow-500" />}
            Configurações WhatsApp
            {isGlobalSettings && <span className="text-lg text-muted-foreground">(Global)</span>}
          </h1>
          <p className="text-muted-foreground">
            {isGlobalSettings 
              ? 'Configure as configurações globais do WhatsApp para todas as clínicas'
              : 'Configure a integração para envio automático de formulários'
            }
          </p>
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

      {isGlobalSettings && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <strong>Configurações Globais:</strong> Estas configurações serão aplicadas como padrão para todas as clínicas. 
            Cada clínica pode sobrescrever essas configurações com suas próprias configurações específicas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuração Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Configuração de Conexão
            </CardTitle>
            <CardDescription>
              {isGlobalSettings 
                ? 'Configure as credenciais globais do WhatsApp'
                : 'Configure sua API do WhatsApp para envio automático'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Token de acesso permanente da sua aplicação Meta
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="businessAccountId">Business Account ID *</Label>
                  <Input
                    id="businessAccountId"
                    value={formConfig.business_account_id || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, business_account_id: e.target.value })}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ID da sua conta comercial do WhatsApp
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    value={formConfig.phone_number || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, phone_number: e.target.value })}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ID do número verificado (não é o número do telefone)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL (Opcional)</Label>
                  <Input
                    id="webhookUrl"
                    value={formConfig.webhook_url || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, webhook_url: e.target.value })}
                    placeholder="https://seu-app.com/webhook/whatsapp"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL para receber callbacks do WhatsApp
                  </p>
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
                <span className="text-sm text-muted-foreground">Ativo:</span>
                <Badge variant={formConfig.is_active ? 'default' : 'secondary'}>
                  {formConfig.is_active ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Provedor:</span>
                <span className="text-sm font-medium capitalize">{formConfig.provider || 'Não configurado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="text-sm font-medium">
                  {isGlobalSettings ? 'Global' : 'Clínica'}
                </span>
              </div>
              {formConfig.provider === 'evolution' && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessão:</span>
                  <span className="text-sm font-medium">{formConfig.session_name || 'Não configurada'}</span>
                </div>
              )}
              {formConfig.provider === 'meta' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Business Account:</span>
                    <span className="text-sm font-medium">{formConfig.business_account_id || 'Não configurado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number ID:</span>
                    <span className="text-sm font-medium">{formConfig.phone_number || 'Não configurado'}</span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Como configurar:</h4>
              {formConfig.provider === 'meta' ? (
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse o Facebook Business Manager</li>
                  <li>Configure sua conta comercial do WhatsApp</li>
                  <li>Obtenha o Access Token permanente</li>
                  <li>Copie o Business Account ID e Phone Number ID</li>
                  <li>Cole as informações nos campos acima</li>
                  <li>Teste a conexão</li>
                </ol>
              ) : (
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Escolha seu provedor de API WhatsApp</li>
                  <li>Insira suas credenciais de acesso</li>
                  <li>Teste a conexão</li>
                  <li>Salve as configurações</li>
                </ol>
              )}
            </div>

            {isConnected && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">
                  ✅ WhatsApp conectado com sucesso! Os formulários agora serão enviados automaticamente.
                </p>
              </div>
            )}

            {formConfig.provider === 'meta' && !isConnected && formConfig.access_token && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700">
                  ⚠️ Verifique se todos os campos estão preenchidos corretamente e se o token ainda é válido.
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
      </div>
    </div>
  );
};
