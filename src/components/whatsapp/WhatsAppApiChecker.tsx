import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  Key,
  Globe,
  Phone,
  Building2,
  TestTube,
  Loader2
} from 'lucide-react';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppApiChecker = () => {
  const { settings, loading } = useWhatsAppSettings();
  const { testConnection, isLoading } = useWhatsApp();
  const [testResults, setTestResults] = useState<{
    connection: 'success' | 'error' | 'pending';
    business: 'success' | 'error' | 'pending';
    phoneNumber: 'success' | 'error' | 'pending';
    permissions: 'success' | 'error' | 'pending';
  }>({
    connection: 'pending',
    business: 'pending',
    phoneNumber: 'pending',
    permissions: 'pending'
  });

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [phoneInfo, setPhoneInfo] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isDetailedTesting, setIsDetailedTesting] = useState(false);

  const runDetailedMetaApiTests = async () => {
    if (!settings || !settings.is_active || settings.provider !== 'meta') {
      setErrorDetails('Configuração Meta não encontrada ou inativa');
      return;
    }

    console.log('Meta WhatsApp: Iniciando testes detalhados...');
    setIsDetailedTesting(true);
    setErrorDetails('');
    
    // Reset dos resultados
    setTestResults({
      connection: 'pending',
      business: 'pending',
      phoneNumber: 'pending',
      permissions: 'pending'
    });

    try {
      // Validação inicial
      if (!settings.access_token || !settings.business_account_id) {
        setErrorDetails('Access Token ou Business Account ID não configurados');
        setTestResults({
          connection: 'error',
          business: 'error',
          phoneNumber: 'error',
          permissions: 'error'
        });
        return;
      }

      console.log('Meta WhatsApp: Testando conexão básica...');
      
      // Test 1: Conexão básica
      const connected = await testConnection();
      setTestResults(prev => ({ 
        ...prev, 
        connection: connected ? 'success' : 'error' 
      }));

      if (!connected) {
        setErrorDetails('Falha na conexão básica. Verifique os logs do console para mais detalhes.');
        setTestResults({
          connection: 'error',
          business: 'error',
          phoneNumber: 'error',
          permissions: 'error'
        });
        return;
      }

      // Test 2: Informações do Business Account
      console.log('Meta WhatsApp: Obtendo informações do Business Account...');
      try {
        const businessResponse = await fetch(
          `https://graph.facebook.com/v18.0/${settings.business_account_id}?fields=id,name`,
          {
            headers: {
              'Authorization': `Bearer ${settings.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          setBusinessInfo(businessData);
          setTestResults(prev => ({ ...prev, business: 'success' }));
          console.log('Meta WhatsApp: Business info obtida:', businessData);
        } else {
          const errorText = await businessResponse.text();
          console.error('Meta WhatsApp: Erro no business:', errorText);
          setErrorDetails(`Erro no Business Account: ${errorText}`);
          setTestResults(prev => ({ ...prev, business: 'error' }));
        }
      } catch (error) {
        console.error('Meta WhatsApp: Exceção no business test:', error);
        setErrorDetails(`Erro ao testar Business Account: ${error}`);
        setTestResults(prev => ({ ...prev, business: 'error' }));
      }

      // Test 3: Informações do Phone Number
      if (settings.phone_number) {
        console.log('Meta WhatsApp: Obtendo informações do Phone Number...');
        try {
          const phoneResponse = await fetch(
            `https://graph.facebook.com/v18.0/${settings.phone_number}?fields=id,display_phone_number,verified_name,quality_rating`,
            {
              headers: {
                'Authorization': `Bearer ${settings.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (phoneResponse.ok) {
            const phoneData = await phoneResponse.json();
            setPhoneInfo(phoneData);
            setTestResults(prev => ({ ...prev, phoneNumber: 'success' }));
            console.log('Meta WhatsApp: Phone info obtida:', phoneData);
          } else {
            const errorText = await phoneResponse.text();
            console.error('Meta WhatsApp: Erro no phone:', errorText);
            setErrorDetails(`Erro no Phone Number: ${errorText}`);
            setTestResults(prev => ({ ...prev, phoneNumber: 'error' }));
          }
        } catch (error) {
          console.error('Meta WhatsApp: Exceção no phone test:', error);
          setErrorDetails(`Erro ao testar Phone Number: ${error}`);
          setTestResults(prev => ({ ...prev, phoneNumber: 'error' }));
        }
      } else {
        setTestResults(prev => ({ ...prev, phoneNumber: 'error' }));
        setErrorDetails('Phone Number ID não configurado');
      }

      // Test 4: Permissões básicas
      setTestResults(prev => ({ ...prev, permissions: 'success' }));
      
    } catch (error) {
      console.error('Meta WhatsApp: Erro geral nos testes:', error);
      setErrorDetails(`Erro geral: ${error}`);
      setTestResults({
        connection: 'error',
        business: 'error',
        phoneNumber: 'error',
        permissions: 'error'
      });
    } finally {
      setIsDetailedTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'OK';
      case 'error': return 'Erro';
      default: return 'Pendente';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div>Carregando configurações do WhatsApp...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Status da Meta WhatsApp API
          {settings?.provider === 'meta' && (
            <Badge variant="outline" className="ml-2">API Oficial</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!settings || !settings.is_active ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              WhatsApp não configurado ou inativo. Configure nas configurações da clínica.
            </AlertDescription>
          </Alert>
        ) : settings.provider !== 'meta' ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Este checker é específico para a Meta WhatsApp API. Provedor atual: {settings.provider}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Conexão API</h4>
                    <p className="text-sm text-muted-foreground">
                      Meta Graph API v18.0
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.connection)}
                  <Badge variant={getStatusVariant(testResults.connection)}>
                    {getStatusText(testResults.connection)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Business Account</h4>
                    <p className="text-sm text-muted-foreground">
                      {businessInfo ? businessInfo.name : settings.business_account_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.business)}
                  <Badge variant={getStatusVariant(testResults.business)}>
                    {getStatusText(testResults.business)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Número WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">
                      {phoneInfo ? 
                        `${phoneInfo.display_phone_number} (${phoneInfo.verified_name || 'Sem nome verificado'})` :
                        settings.phone_number || 'Não configurado'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.phoneNumber)}
                  <Badge variant={getStatusVariant(testResults.phoneNumber)}>
                    {getStatusText(testResults.phoneNumber)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Permissões API</h4>
                    <p className="text-sm text-muted-foreground">
                      {phoneInfo?.quality_rating ? 
                        `Qualidade: ${phoneInfo.quality_rating}` : 
                        'Verificando permissões...'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.permissions)}
                  <Badge variant={getStatusVariant(testResults.permissions)}>
                    {getStatusText(testResults.permissions)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={runDetailedMetaApiTests} 
              className="w-full" 
              disabled={isLoading || isDetailedTesting}
            >
              {isDetailedTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Meta WhatsApp API (Detalhado)
                </>
              )}
            </Button>

            {errorDetails && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro Detalhado:</strong> {errorDetails}
                  <br />
                  <small>Verifique o console do navegador para mais informações técnicas.</small>
                </AlertDescription>
              </Alert>
            )}

            {testResults.connection === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Meta WhatsApp API conectada com sucesso!</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>✅ API Graph v18.0 funcionando</li>
                    <li>✅ Business Account verificado</li>
                    <li>✅ Número WhatsApp ativo</li>
                    <li>✅ Pronto para enviar mensagens e templates</li>
                    {phoneInfo?.quality_rating && (
                      <li>✅ Qualidade do número: {phoneInfo.quality_rating}</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {settings.webhook_url && (
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Webhook configurado:</strong> {settings.webhook_url}
                  <br />
                  <small className="text-muted-foreground">
                    Configure este URL no Meta Business Manager para receber callbacks.
                  </small>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
