
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, Phone, Smartphone } from 'lucide-react';
import { usePatientWhatsApp } from '@/hooks/usePatientWhatsApp';
import { toast } from 'sonner';

interface PatientWhatsAppConfigProps {
  initialPhone?: string;
  onPhoneUpdate?: (phone: string) => void;
}

export const PatientWhatsAppConfig: React.FC<PatientWhatsAppConfigProps> = ({
  initialPhone = '',
  onPhoneUpdate
}) => {
  const { isConnected, saveWhatsAppNumber, testConnection, loading } = usePatientWhatsApp();
  const [phone, setPhone] = useState(initialPhone);
  const [enableNotifications, setEnableNotifications] = useState(!!initialPhone);
  const [testing, setTesting] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Aplicar formatação brasileira
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return cleaned;
      });
    }
    
    return cleaned.slice(0, 11);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      toast.error('Por favor, insira um número de telefone');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast.error('Número de telefone inválido');
      return;
    }

    try {
      await saveWhatsAppNumber(cleanPhone);
      onPhoneUpdate?.(cleanPhone);
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleTest = async () => {
    if (!phone.trim()) {
      toast.error('Por favor, configure um número primeiro');
      return;
    }

    setTesting(true);
    try {
      const success = await testConnection();
      if (success) {
        toast.success('Teste realizado com sucesso! Verifique seu WhatsApp.');
      } else {
        toast.error('Falha no teste de conexão');
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTesting(false);
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setEnableNotifications(enabled);
    if (!enabled) {
      setPhone('');
      onPhoneUpdate?.('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg md:text-xl">WhatsApp</CardTitle>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300">
              <Check className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          Configure seu WhatsApp para receber formulários e lembretes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex-1 min-w-0 pr-4">
            <Label className="text-sm md:text-base font-medium">Receber via WhatsApp</Label>
            <p className="text-xs md:text-sm text-muted-foreground">
              Ativar notificações e formulários por WhatsApp
            </p>
          </div>
          <Switch
            checked={enableNotifications}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        {enableNotifications && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <Label htmlFor="whatsapp-phone" className="text-sm md:text-base">
                Número do WhatsApp
              </Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Digite apenas números. Formato: (00) 00000-0000
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSave}
                disabled={loading || !phone.trim()}
                className="flex-1 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white min-h-[44px]"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing || !phone.trim() || !isConnected}
                className="flex-1 min-h-[44px]"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {testing ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </div>

            {isConnected && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">WhatsApp conectado com sucesso!</span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Você receberá formulários e lembretes no número configurado.
                </p>
              </div>
            )}

            {!isConnected && phone && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
                  <X className="h-4 w-4" />
                  <span className="font-medium">Aguardando conexão</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  Salve a configuração e teste a conexão para ativar o WhatsApp.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
