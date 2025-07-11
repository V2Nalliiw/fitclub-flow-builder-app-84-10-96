import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Image, Video, Music, MessageSquare } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface FormEndNodeConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const FormEndNodeConfig: React.FC<FormEndNodeConfigProps> = ({
  config,
  setConfig,
}) => {
  const { uploadFile, uploading } = useFileUpload('flow-documents');
  const [dragActive, setDragActive] = useState(false);

  const arquivos = config.arquivos || [];

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validação de tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/avi',
        'audio/mp3', 'audio/wav', 'audio/ogg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        continue;
      }

      // Validação de tamanho (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Arquivo muito grande: ${file.name}. Máximo 10MB.`);
        continue;
      }

      try {
        const uploadedFile = await uploadFile(file);
        if (uploadedFile) {
          // Gerar URL público correto do Supabase Storage  
          const filePath = uploadedFile.url || uploadedFile.name;
          const publicUrl = `https://oilnybhaboefqyhjrmvl.supabase.co/storage/v1/object/public/flow-documents/${filePath}`;
          
          const newArquivos = [...arquivos, {
            id: uploadedFile.id || crypto.randomUUID(),
            nome: uploadedFile.name || file.name,
            url: filePath, // Path relativo para storage
            publicUrl: publicUrl, // URL público completo
            tipo: uploadedFile.type || file.type,
            tamanho: uploadedFile.size || file.size,
            uploadedAt: uploadedFile.uploadedAt || new Date().toISOString()
          }];
          
          setConfig({ ...config, arquivos: newArquivos });
          toast.success(`Arquivo ${file.name} enviado com sucesso!`);
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    const newArquivos = arquivos.filter((arquivo: any) => arquivo.id !== fileId);
    setConfig({ ...config, arquivos: newArquivos });
    toast.success('Arquivo removido');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (tipo.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (tipo.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <Label htmlFor="titulo">Título do Conteúdo</Label>
        <Input
          id="titulo"
          value={String(config.titulo || '')}
          onChange={(e) => setConfig({ ...config, titulo: e.target.value })}
          placeholder="Ex: Material do Dia 3"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={String(config.descricao || '')}
          onChange={(e) => setConfig({ ...config, descricao: e.target.value })}
          placeholder="Descrição do conteúdo que será enviado..."
          className="mt-1"
        />
      </div>

      {/* Upload de Arquivos */}
      <div>
        <Label>Arquivos para Download</Label>
        
        {/* Área de Upload */}
        <div
          className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            PDF, Imagens, Vídeos, Áudios (máx. 10MB cada)
          </p>
          <Input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.avi,.mp3,.wav,.ogg"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
          </Button>
        </div>

        {/* Lista de Arquivos */}
        {arquivos.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm">Arquivos Selecionados ({arquivos.length})</Label>
            {arquivos.map((arquivo: any) => (
              <div
                key={arquivo.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(arquivo.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(arquivo.tamanho)} • {arquivo.tipo}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(arquivo.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ação Automática */}
      <Card className="bg-muted/50 border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Ação Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-2">
            Ao atingir este nó, será enviada automaticamente uma mensagem no WhatsApp com:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Template</Badge>
              <span className="text-xs text-muted-foreground">formulario_concluido</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Conteúdo</Badge>
              <span className="text-xs text-muted-foreground">
                {arquivos.length > 0 
                  ? `Link com ${arquivos.length} arquivo(s) para download`
                  : 'Mensagem de conclusão'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};