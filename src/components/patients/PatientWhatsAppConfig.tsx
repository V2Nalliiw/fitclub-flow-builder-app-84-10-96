
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, AlertCircle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatientWhatsAppConfigProps {
  initialPhone?: string;
  onPhoneUpdate?: (phone: string) => void;
}

export const PatientWhatsAppConfig = ({ initialPhone, onPhoneUpdate }: PatientWhatsAppConfigProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState(initialPhone || '');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    let formatted = numbers;
    if (numbers.length > 0 && !numbers.startsWith('55')) {
      formatted = '55' + numbers;
    }
    
    // Formata para exibição
    if (formatted.length >= 13) {
      const country = formatted.slice(0, 2);
      const area = formatted.slice(2, 4);
      const firstPart = formatted.slice(4, 9);
      const secondPart = formatted.slice(9, 13);
      return `+${country} (${area}) ${firstPart}-${secondPart}`;
    }
    
    return value;
  };

  const getCleanPhoneNumber = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, '');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSavePhone = async () => {
    if (!user?.id) return;
    
    const cleanPhone = getCleanPhoneNumber(phone);
    if (cleanPhone.length < 13) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de WhatsApp válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "WhatsApp salvo",
        description: "Seu número de WhatsApp foi salvo com sucesso",
      });
      
      onPhoneUpdate?.(cleanPhone);
      
      // Simular envio de código de verificação
      setShowVerification(true);
      
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular verificação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        setIsVerified(true);
        setShowVerification(false);
        toast({
          title: "WhatsApp verificado",
          description: "Seu WhatsApp foi verificado com sucesso",
        });
      } else {
        toast({
          title: "Código incorreto",
          description: "O código informado está incorreto",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPhone('');
      setIsVerified(false);
      setShowVerification(false);
      onPhoneUpdate?.('');
      
      toast({
        title: "WhatsApp removido",
        description: "Seu número de WhatsApp foi removido",
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>WhatsApp</CardTitle>
          </div>
          <Badge variant={isVerified ? 'default' : 'secondary'}>
            {isVerified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Não verificado
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Configure seu WhatsApp para receber notificações e formulários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="whatsapp">Número do WhatsApp</Label>
          <Input
            id="whatsapp"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+55 (11) 99999-9999"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Insira seu número com DDD (será usado para receber formulários)
          </p>
        </div>

        {!showVerification ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSavePhone} 
              disabled={isLoading || !phone} 
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar e Verificar'}
            </Button>
            {phone && (
              <Button 
                variant="outline" 
                onClick={handleRemovePhone}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Enviamos um código de verificação para seu WhatsApp. 
                Digite o código abaixo para confirmar.
              </p>
            </div>
            <div>
              <Label htmlFor="verification">Código de Verificação</Label>
              <Input
                id="verification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowVerification(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Seu WhatsApp está verificado e você receberá notificações e formulários neste número.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
