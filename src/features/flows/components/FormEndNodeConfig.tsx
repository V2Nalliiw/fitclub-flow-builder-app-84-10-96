import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, FileText, Files, Plus, MessageSquare } from 'lucide-react';
import { ClinicDocumentGalleryNew } from '@/components/flows/ClinicDocumentGalleryNew';
import { ClinicDocument } from '@/hooks/useClinicDocuments';

interface FormEndNodeConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const FormEndNodeConfig: React.FC<FormEndNodeConfigProps> = ({ config, setConfig }) => {
  const [titulo, setTitulo] = useState(config.titulo || '');
  const [descricao, setDescricao] = useState(config.descricao || '');
  const [selectedDocuments, setSelectedDocuments] = useState<ClinicDocument[]>(
    config.arquivos?.map((arquivo: any) => ({
      id: arquivo.id || arquivo.document_id,
      clinic_id: arquivo.clinic_id || '',
      filename: arquivo.filename || arquivo.file_url?.split('/').pop() || '',
      original_filename: arquivo.original_filename || arquivo.filename || 'Arquivo',
      file_url: arquivo.file_url || arquivo.publicUrl || arquivo.url,
      file_type: arquivo.file_type || arquivo.tipo || 'application/octet-stream',
      file_size: arquivo.file_size || arquivo.tamanho || 0,
      category: arquivo.category || 'geral',
      theme: arquivo.theme,
      description: arquivo.description,
      tags: arquivo.tags || [],
      is_active: true,
      created_at: arquivo.created_at || new Date().toISOString(),
      updated_at: arquivo.updated_at || new Date().toISOString(),
      created_by: arquivo.created_by || ''
    })) || []
  );

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitulo = e.target.value;
    setTitulo(newTitulo);
    setConfig({
      ...config,
      titulo: newTitulo
    });
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescricao = e.target.value;
    setDescricao(newDescricao);
    setConfig({
      ...config,
      descricao: newDescricao
    });
  };

  const handleDocumentSelect = (documents: ClinicDocument[]) => {
    setSelectedDocuments(documents);
    // Convert to the format expected by the flow system
    const arquivos = documents.map(doc => ({
      id: doc.id,
      document_id: doc.id,
      clinic_id: doc.clinic_id,
      filename: doc.original_filename,
      original_filename: doc.original_filename,
      file_url: doc.file_url,
      publicUrl: doc.file_url,
      url: doc.file_url,
      file_type: doc.file_type,
      tipo: doc.file_type,
      file_size: doc.file_size,
      tamanho: doc.file_size,
      category: doc.category,
      theme: doc.theme,
      description: doc.description,
      tags: doc.tags,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      created_by: doc.created_by,
      uploadedAt: doc.created_at
    }));
    
    setConfig({
      ...config,
      arquivos
    });
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
          type="text"
          value={titulo}
          onChange={handleTituloChange}
          placeholder="Ex: Material do Dia 3"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={handleDescricaoChange}
          placeholder="Descrição do conteúdo que será enviado..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label>Arquivos Selecionados ({selectedDocuments.length})</Label>
        <div className="mt-2 space-y-2">
          {selectedDocuments.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{document.original_filename}</p>
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <span>{document.file_type.split('/')[1]?.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.file_size)}</span>
                        {document.category && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">{document.category}</Badge>
                          </>
                        )}
                        {document.theme && (
                          <Badge variant="outline" className="text-xs">{document.theme}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              <Files className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Nenhum arquivo selecionado</p>
              <p className="text-sm">Selecione documentos na galeria abaixo</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Galeria de Documentos da Clínica</Label>
        <div className="mt-2 border rounded-lg overflow-hidden">
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Files className="h-4 w-4" />
                Galeria
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Novo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="p-4 max-h-96 overflow-y-auto">
              <ClinicDocumentGalleryNew 
                onDocumentSelect={handleDocumentSelect}
                selectedDocuments={selectedDocuments}
                multiSelect={true}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="p-4">
              <div className="text-center py-6 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Upload direto disponível na galeria</p>
                <p className="text-sm">Vá para a aba "Galeria" e clique em "Upload" para adicionar novos documentos</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedDocuments.length > 0 && (
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm font-medium text-primary">
            ✓ {selectedDocuments.length} documento{selectedDocuments.length > 1 ? 's' : ''} será{selectedDocuments.length > 1 ? 'ão' : ''} enviado{selectedDocuments.length > 1 ? 's' : ''} para o paciente
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Os pacientes receberão links seguros por WhatsApp para download dos materiais
          </p>
        </div>
      )}

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
              <span className="text-xs text-muted-foreground">material_disponivel</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Conteúdo</Badge>
              <span className="text-xs text-muted-foreground">
                {selectedDocuments.length > 0 
                  ? `Links seguros para ${selectedDocuments.length} arquivo(s)`
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