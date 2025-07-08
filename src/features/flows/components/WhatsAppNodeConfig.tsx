
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface WhatsAppNodeConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
  formName?: string;
  formId?: string;
}

export const WhatsAppNodeConfig: React.FC<WhatsAppNodeConfigProps> = ({
  config,
  setConfig,
  formName,
  formId,
}) => {
  const { isConnected, testConnection } = useWhatsApp();
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTestMessage = async () => {
    if (!testPhone) return;
    
    setIsTesting(true);
    
    // Simular teste de mensagem
    setTimeout(() => {
      setIsTesting(false);
    }, 2000);
  };

  const generateDefaultMessage = () => {
    if (!formName || !formId) return '';
    
    const formUrl = `${window.location.origin}/forms/${formId}`;
    return `📋 *${formName}*\n\nOlá! Você tem um formulário para preencher.\n\n🔗 Acesse o link: ${formUrl}\n\n_Responda assim que possível._`;
  };

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card className={`${isConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">WhatsApp Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800">WhatsApp Desconectado</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            {isConnected 
              ? 'As mensagens serão enviadas automaticamente via WhatsApp.'
              : 'Configure a conexão WhatsApp nas configurações para ativar o envio automático.'}
          </p>
          {!isConnected && (
            <Button variant="outline" size="sm" onClick={testConnection}>
              <TestTube className="h-3 w-3 mr-1" />
              Testar Conexão
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Configuração do Envio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sendToWhatsApp">Enviar por WhatsApp</Label>
          <Switch
            id="sendToWhatsApp"
            checked={Boolean(config.sendToWhatsApp)}
            onCheckedChange={(checked) => setConfig({ ...config, sendToWhatsApp: checked })}
          />
        </div>
        
        {config.sendToWhatsApp && (
          <>
            <div>
              <Label htmlFor="whatsAppMessage">Mensagem Personalizada</Label>
              <Textarea
                id="whatsAppMessage"
                value={String(config.whatsAppMessage || generateDefaultMessage())}
                onChange={(e) => setConfig({ ...config, whatsAppMessage: e.target.value })}
                placeholder="Personalize a mensagem que será enviada..."
                className="mt-1 text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A URL do formulário será incluída automaticamente na mensagem.
              </p>
            </div>

            {/* Teste de Mensagem */}
            {isConnected && (
              <div className="space-y-2">
                <Label htmlFor="testPhone">Teste de Envio (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="testPhone"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="5511999999999"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestMessage}
                    disabled={!testPhone || isTesting}
                  >
                    {isTesting ? 'Enviando...' : 'Testar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite um número com código do país (ex: 5511999999999)
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ação Automática Info */}
      {config.sendToWhatsApp && (
        <Card className="bg-muted/50 border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ação Automática Configurada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Quando o fluxo atingir este nó, será enviada automaticamente uma mensagem 
              no WhatsApp com o link do formulário para o paciente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
