import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const TestFormEnd: React.FC = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);

  const testCompleteFlow = async () => {
    if (!user) return;

    setTesting(true);
    try {
      // Buscar uma execução completada recente
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('patient_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!execution) {
        toast.error('Nenhuma execução completada encontrada');
        return;
      }

      // Buscar o flow para encontrar o nó FormEnd
      const { data: flow } = await supabase
        .from('flows')
        .select('nodes')
        .eq('id', execution.flow_id)
        .single();

      if (!flow?.nodes) {
        toast.error('Flow não encontrado');
        return;
      }

      const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
      const formEndNode = nodes.find((node: any) => node.type === 'formEnd');

      if (!formEndNode) {
        toast.error('Nó FormEnd não encontrado');
        return;
      }

      console.log('🎯 Teste: Nó FormEnd encontrado:', formEndNode);

      // Processar FormEnd manualmente
      const nodeData = (formEndNode as any).data;
      const arquivosNormalizados = (nodeData.arquivos || []).map((arquivo: any) => {
        let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
        
        if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
          const parts = cleanUrl.split('https://');
          cleanUrl = 'https://' + parts[parts.length - 1];
        }
        
        if (cleanUrl.includes('/flow-documents/')) {
          cleanUrl = cleanUrl.replace('/flow-documents/', '/clinic-materials/');
        }
        
        return {
          id: arquivo.id || arquivo.document_id,
          nome: arquivo.original_filename || arquivo.filename || arquivo.nome || 'Arquivo',
          url: cleanUrl,
          tipo: arquivo.file_type || arquivo.tipo || 'application/octet-stream',
          tamanho: arquivo.file_size || arquivo.tamanho || 0,
          original_filename: arquivo.original_filename || arquivo.filename || arquivo.nome,
          file_url: cleanUrl,
          file_type: arquivo.file_type || arquivo.tipo,
          file_size: arquivo.file_size || arquivo.tamanho
        };
      });

      console.log('📁 Teste: Arquivos normalizados:', arquivosNormalizados);

      if (arquivosNormalizados.length === 0) {
        toast.error('Nenhum arquivo encontrado no FormEnd');
        return;
      }

      // Criar registro content_access
      const accessToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: patient } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('user_id', user.id)
        .single();

      const { data: contentAccessData, error: insertError } = await supabase
        .from('content_access')
        .insert({
          execution_id: execution.id,
          patient_id: user.id,
          access_token: accessToken,
          files: arquivosNormalizados,
          expires_at: expiresAt.toISOString(),
          metadata: {
            patient_name: patient?.name || 'Paciente',
            flow_name: nodeData.titulo || 'Formulário',
            form_name: nodeData.titulo || 'Formulário',
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar content_access:', insertError);
        toast.error('Erro ao criar acesso ao conteúdo');
        return;
      }

      console.log('✅ content_access criado:', contentAccessData);

      // Criar URL de conteúdo
      const contentUrl = `${window.location.origin}/conteudo-formulario/${execution.id}?token=${accessToken}`;
      console.log('🔗 URL gerada:', contentUrl);

      // Tentar enviar WhatsApp
      if (patient?.phone) {
        const message = `🎉 *Formulário Concluído!*

Olá ${patient.name}! Você concluiu o formulário com sucesso.

📁 *Seus materiais estão prontos:*
${contentUrl}

_Este link expira em 30 dias._`;

        console.log('📱 Tentando enviar WhatsApp...');
        
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            phone: patient.phone,
            message: message
          }
        });

        if (whatsappError) {
          console.error('❌ Erro WhatsApp:', whatsappError);
          toast.error('Erro ao enviar WhatsApp');
        } else {
          console.log('✅ WhatsApp enviado:', whatsappResult);
          toast.success('WhatsApp enviado com sucesso!');
        }
      }

      toast.success('Teste concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast.error('Erro no teste');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-[#0E0E0E] p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Teste FormEnd</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Este teste irá:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Buscar uma execução completada recente</li>
              <li>Encontrar o nó FormEnd no flow</li>
              <li>Processar os arquivos</li>
              <li>Criar registro content_access</li>
              <li>Enviar WhatsApp</li>
            </ul>
            
            <Button 
              onClick={testCompleteFlow}
              disabled={testing}
              className="w-full"
            >
              {testing ? 'Testando...' : 'Executar Teste'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};