
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
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { useClinics } from '@/hooks/useClinics';

interface PatientWhatsAppConfigProps {
  initialPhone?: string;
  onPhoneUpdate?: (phone: string) => void;
}

export const PatientWhatsAppConfig = ({ initialPhone, onPhoneUpdate }: PatientWhatsAppConfigProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useWhatsApp();
  const { renderTemplate } = useWhatsAppTemplates();
  const { clinics } = useClinics();
  const [phone, setPhone] = useState(initialPhone || '');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [sentCode, setSentCode] = useState('');

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

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
      // Gerar código de verificação
      const code = generateVerificationCode();
      setSentCode(code);
      
      console.log('PatientWhatsAppConfig: Iniciando envio do código de verificação');
      console.log('PatientWhatsAppConfig: Número limpo:', cleanPhone);
      console.log('PatientWhatsAppConfig: Código gerado:', code);
      
      // Buscar nome da clínica
      const clinic = clinics.find(c => c.id === user?.clinic_id);
      const clinicName = clinic?.name || 'FitClub';
      
      // Renderizar template de verificação
      const verificationMessage = await renderTemplate('codigo_verificacao', {
        code: code,
        clinic_name: clinicName,
        expiry_time: '5 minutos'
      });
      
      console.log('PatientWhatsAppConfig: Enviando mensagem para:', cleanPhone);
      console.log('PatientWhatsAppConfig: Mensagem renderizada:', verificationMessage);
      
      const result = await sendMessage(cleanPhone, verificationMessage);
      
      console.log('PatientWhatsAppConfig: Resultado do envio:', result);
      
      if (!result.success) {
        console.error('PatientWhatsAppConfig: Falha no envio:', result.error);
        toast({
          title: "Erro ao enviar código",
          description: result.error || "Não foi possível enviar o código de verificação. Verifique se o WhatsApp está configurado nas configurações da clínica.",
          variant: "destructive",
        });
        return;
      }

      // Salvar telefone temporariamente (não verificado ainda)
      const { error } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone })
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('PatientWhatsAppConfig: Código enviado com sucesso!');
      toast({
        title: "Código enviado",
        description: "Código de verificação enviado para seu WhatsApp",
      });
      
      onPhoneUpdate?.(cleanPhone);
      setShowVerification(true);
      
      // Configurar timeout para expirar o código
      setTimeout(() => {
        setSentCode('');
        if (showVerification) {
          toast({
            title: "Código expirado",
            description: "O código de verificação expirou. Solicite um novo código.",
            variant: "destructive",
          });
        }
      }, 300000); // 5 minutos
      
    } catch (error: any) {
      console.error('PatientWhatsAppConfig: Erro ao salvar telefone:', error);
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

    if (!sentCode) {
      toast({
        title: "Código expirado",
        description: "O código de verificação expirou. Solicite um novo código.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (verificationCode === sentCode) {
        // Marcar como verificado (aqui você pode adicionar uma flag no banco de dados se necessário)
        setIsVerified(true);
        setShowVerification(false);
        setSentCode('');
        
        console.log('PatientWhatsAppConfig: WhatsApp verificado com sucesso!');
        toast({
          title: "WhatsApp verificado",
          description: "Seu WhatsApp foi verificado com sucesso",
        });
      } else {
        console.log('PatientWhatsAppConfig: Código incorreto fornecido');
        toast({
          title: "Código incorreto",
          description: "O código informado está incorreto. Verifique e tente novamente.",
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
      setSentCode('');
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

  const handleResendCode = () => {
    setShowVerification(false);
    setSentCode('');
    setVerificationCode('');
    handleSavePhone();
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
              {isLoading ? 'Enviando código...' : 'Enviar Código de Verificação'}
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
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">
                Enviamos um código de verificação para seu WhatsApp. 
                Digite o código de 6 dígitos abaixo para confirmar.
              </p>
            </div>
            <div>
              <Label htmlFor="verification">Código de Verificação</Label>
              <Input
                id="verification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                O código expira em 5 minutos
              </p>
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
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Reenviar
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowVerification(false);
                setSentCode('');
                setVerificationCode('');
              }}
              disabled={isLoading}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        )}

        {isVerified && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Seu WhatsApp está verificado e você receberá notificações e formulários neste número.
            </p>
          </div>
        )}
        
        {!isVerified && phone && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Seu número foi salvo mas ainda não foi verificado. Complete a verificação para receber mensagens.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
