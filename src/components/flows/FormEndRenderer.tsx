import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, FileText, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RobustDocumentDownload } from './RobustDocumentDownload';

interface FormEndRendererProps {
  step: any;
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const FormEndRenderer: React.FC<FormEndRendererProps> = ({
  step,
  onComplete,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Auto-trigger para FormEnd
  useEffect(() => {
    handleFormEndWhatsApp();
  }, []);

  const createContentAccess = async (executionId: string, patientId: string, files: any[]) => {
    console.log('🔐 FormEnd: Criando content access...');
    
    try {
      const { data: contentAccess, error } = await supabase
        .from('content_access')
        .insert({
          execution_id: executionId,
          patient_id: patientId,
          files: files,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          metadata: {
            node_type: 'formEnd',
            created_by: 'FormEndRenderer',
            file_count: files.length
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar content access:', error);
        return null;
      }

      console.log('✅ Content access criado:', contentAccess.id);
      
      // Log da criação
      await supabase.from('flow_logs').insert({
        execution_id: executionId,
        patient_id: patientId,
        node_id: step.nodeId || 'formEnd',
        node_type: 'formEnd',
        action: 'content_access_created',
        status: 'completed',
        metadata: {
          access_id: contentAccess.id,
          file_count: files.length,
          expires_at: contentAccess.expires_at
        }
      });

      return contentAccess;
    } catch (error) {
      console.error('❌ Erro crítico ao criar content access:', error);
      return null;
    }
  };

  const handleFormEndWhatsApp = async () => {
    console.log('🏁 FormEnd: Processando materiais automaticamente');
    setWhatsappStatus('sending');
    
    try {
      // Buscar executionId da URL
      const executionId = window.location.pathname.split('/').pop();
      
      if (!executionId) {
        console.error('❌ FormEnd: ExecutionId não encontrado');
        setWhatsappStatus('error');
        return;
      }

      // Log início do processo
      await supabase.from('flow_logs').insert({
        execution_id: executionId,
        patient_id: '',
        node_id: step.nodeId || 'formEnd',
        node_type: 'formEnd',
        action: 'process_start',
        status: 'processing',
        metadata: { step_data: step }
      });

      // Buscar dados da execução
      const { data: execution } = await supabase
        .from('flow_executions')
        .select('patient_id')
        .eq('id', executionId)
        .single();

      if (!execution) {
        console.error('❌ FormEnd: Execução não encontrada');
        setWhatsappStatus('error');
        
        await supabase.from('flow_logs').insert({
          execution_id: executionId,
          patient_id: '',
          node_id: step.nodeId || 'formEnd',
          node_type: 'formEnd',
          action: 'execution_not_found',
          status: 'error',
          error_message: 'Execution not found'
        });
        return;
      }

      console.log('📊 FormEnd: Execution encontrada, patient:', execution.patient_id);

      // Normalizar arquivos se existirem
      const arquivosNormalizados = (step.arquivos || []).map((arquivo: any) => {
        console.log('📁 FormEnd: Processando arquivo:', arquivo);
        
        let cleanUrl = arquivo.file_url || arquivo.url || arquivo.publicUrl || '';
        
        // Corrigir URLs duplicadas
        if (cleanUrl.includes('https://') && cleanUrl.indexOf('https://') !== cleanUrl.lastIndexOf('https://')) {
          const parts = cleanUrl.split('https://');
          cleanUrl = 'https://' + parts[parts.length - 1];
        }
        
        // Forçar uso apenas do bucket clinic-materials
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

      console.log('📦 FormEnd: Arquivos normalizados:', arquivosNormalizados.length);

      // Enviar materiais se houver arquivos
      if (arquivosNormalizados.length > 0) {
        // Criar content access para downloads seguros
        const contentAccess = await createContentAccess(executionId, execution.patient_id, arquivosNormalizados);
        
        if (!contentAccess) {
          console.error('❌ FormEnd: Falha ao criar content access');
          setWhatsappStatus('error');
          return;
        }

        // Criar links seguros com URL absoluta corrigida
        const secureLinks = arquivosNormalizados.map(arquivo => {
          const proxyUrl = `https://oilnybhaboefqyhjrmvl.supabase.co/functions/v1/serve-content?token=${contentAccess.access_token}&filename=${encodeURIComponent(arquivo.original_filename)}`;
          
          return {
            ...arquivo,
            secure_url: proxyUrl,
            download_instructions: `Clique no link para baixar "${arquivo.original_filename}". Válido por 30 dias.`
          };
        });

        console.log('🔗 FormEnd: Links seguros criados:', secureLinks.length);

        const { data: response, error } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            patientId: execution.patient_id,
            executionId: executionId,
            files: secureLinks,
            contentAccessId: contentAccess.id
          }
        });

        if (error) {
          console.error('❌ FormEnd: Erro ao enviar WhatsApp:', error);
          setWhatsappStatus('error');
          
          await supabase.from('flow_logs').insert({
            execution_id: executionId,
            patient_id: execution.patient_id,
            node_id: step.nodeId || 'formEnd',
            node_type: 'formEnd',
            action: 'whatsapp_send_failed',
            status: 'error',
            error_message: error.message || 'WhatsApp send failed',
            metadata: { file_count: arquivosNormalizados.length }
          });
          
          toast({
            title: "Erro no WhatsApp",
            description: "Não foi possível enviar os materiais",
            variant: "destructive",
          });
        } else {
          console.log('✅ FormEnd: WhatsApp enviado com sucesso:', response);
          setWhatsappStatus('sent');
          
          await supabase.from('flow_logs').insert({
            execution_id: executionId,
            patient_id: execution.patient_id,
            node_id: step.nodeId || 'formEnd',
            node_type: 'formEnd',
            action: 'whatsapp_send_success',
            status: 'completed',
            metadata: { 
              file_count: arquivosNormalizados.length,
              content_access_id: contentAccess.id,
              whatsapp_response: response
            }
          });
          
          toast({
            title: "Materiais Enviados!",
            description: "Arquivos foram enviados por WhatsApp com links seguros",
          });
        }
      } else {
        console.log('📝 FormEnd: Nenhum arquivo para enviar');
        setWhatsappStatus('sent');
        
        await supabase.from('flow_logs').insert({
          execution_id: executionId,
          patient_id: execution.patient_id,
          node_id: step.nodeId || 'formEnd',
          node_type: 'formEnd',
          action: 'no_files_to_send',
          status: 'completed',
          metadata: { message: 'No files to send' }
        });
      }
      
    } catch (error) {
      console.error('❌ FormEnd: Erro crítico:', error);
      setWhatsappStatus('error');
      
      await supabase.from('flow_logs').insert({
        execution_id: window.location.pathname.split('/').pop() || '',
        patient_id: '',
        node_id: step.nodeId || 'formEnd',
        node_type: 'formEnd',
        action: 'critical_error',
        status: 'error',
        error_message: error.message || 'Critical error in FormEnd',
        metadata: { error_stack: error.stack }
      });
      
      toast({
        title: "Erro",
        description: "Falha ao processar materiais no FormEnd",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    console.log('🔄 FormEnd: handleComplete chamado');

    const responseData = {
      nodeId: step.nodeId,
      nodeType: 'formEnd',
      formCompleted: true,
      whatsappStatus,
      timestamp: new Date().toISOString()
    };

    console.log('✅ FormEnd: Enviando responseData:', responseData);
    onComplete(responseData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-[#0E0E0E] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📋 Formulário Concluído!
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {step.title || 'Etapa finalizada com sucesso'}
          </p>

          {step.mensagemFinal && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {step.mensagemFinal}
              </p>
            </div>
          )}

          {/* Arquivos disponíveis para download */}
          {step.arquivos && step.arquivos.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                Materiais
              </h4>
              
              {whatsappStatus === 'sending' && (
                <div className="flex items-center justify-center text-blue-700 dark:text-blue-400 mb-4">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm">Enviando materiais por WhatsApp...</span>
                </div>
              )}
              
              {whatsappStatus === 'sent' && (
                <div className="flex items-center justify-center text-emerald-700 dark:text-emerald-300 mb-4">
                  <Send className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">✅ Materiais enviados por WhatsApp!</span>
                </div>
              )}
              
              {whatsappStatus === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  ❌ Erro ao enviar materiais
                </p>
              )}

              <div className="space-y-3">
                {step.arquivos.slice(0, 3).map((arquivo: any, index: number) => {
                  const fileName = arquivo.original_filename || arquivo.filename || arquivo.nome || 'Material';
                  const displayName = fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
                  
                  return (
                    <div key={index} className="bg-muted/30 border border-muted rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate" title={fileName}>
                            {displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            📎 Material educativo
                          </p>
                        </div>
                        <RobustDocumentDownload 
                          fileName={fileName}
                          fileUrl={arquivo.file_url || arquivo.url || arquivo.publicUrl}
                          documentId={arquivo.id || arquivo.document_id}
                          fileType={arquivo.file_type?.includes('pdf') ? 'pdf' : arquivo.file_type?.includes('image') ? 'image' : 'pdf'}
                        />
                      </div>
                    </div>
                  );
                })}
                {step.arquivos.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    + {step.arquivos.length - 3} arquivo(s) adicional(is)
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-4 mb-6">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">
              🎉 Parabéns! Você concluiu este formulário com sucesso.
            </p>
          </div>

          <Button
            onClick={handleComplete}
            disabled={isLoading || whatsappStatus === 'sending'}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium"
            size="lg"
          >
            {isLoading ? 'Finalizando...' : 'Continuar para Próxima Etapa'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            ✅ Formulário finalizado. Este não é o fim do tratamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};