import React, { useState, useMemo } from 'react';
import { Search, Upload, Filter, FileText, Image, Video, Archive, Tag, Calendar, Trash2, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useClinicDocuments, ClinicDocument } from '@/hooks/useClinicDocuments';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface ClinicDocumentGalleryNewProps {
  onDocumentSelect?: (documents: ClinicDocument[]) => void;
  selectedDocuments?: ClinicDocument[];
  multiSelect?: boolean;
}

const CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'exercicios', label: 'Exercícios' },
  { value: 'dieta', label: 'Dieta' },
  { value: 'orientacoes', label: 'Orientações' },
  { value: 'resultados', label: 'Resultados' },
  { value: 'formularios', label: 'Formulários' }
];

export const ClinicDocumentGalleryNew: React.FC<ClinicDocumentGalleryNewProps> = ({
  onDocumentSelect,
  selectedDocuments = [],
  multiSelect = true
}) => {
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    searchDocuments
  } = useClinicDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [editingDocument, setEditingDocument] = useState<ClinicDocument | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('geral');
  const [uploadTheme, setUploadTheme] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery) {
      filtered = searchDocuments(searchQuery);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedTheme !== 'all') {
      filtered = filtered.filter(doc => doc.theme === selectedTheme);
    }

    return filtered;
  }, [documents, searchQuery, selectedCategory, selectedTheme, searchDocuments]);

  const availableThemes = useMemo(() => {
    const themes = documents
      .filter(doc => doc.theme)
      .map(doc => doc.theme!)
      .filter((theme, index, array) => array.indexOf(theme) === index)
      .sort();
    return themes;
  }, [documents]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentClick = (document: ClinicDocument) => {
    if (!onDocumentSelect) return;

    if (multiSelect) {
      const isSelected = selectedDocuments.some(d => d.id === document.id);
      let newSelection: ClinicDocument[];
      
      if (isSelected) {
        newSelection = selectedDocuments.filter(d => d.id !== document.id);
      } else {
        newSelection = [...selectedDocuments, document];
      }
      
      onDocumentSelect(newSelection);
    } else {
      onDocumentSelect([document]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      const tags = uploadTags.split(',').map(tag => tag.trim()).filter(Boolean);
      await uploadDocument(
        uploadFile,
        uploadCategory,
        uploadTheme || undefined,
        uploadDescription || undefined,
        tags
      );
      
      // Reset form
      setUploadFile(null);
      setUploadCategory('geral');
      setUploadTheme('');
      setUploadDescription('');
      setUploadTags('');
      setUploadDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    try {
      await updateDocument(editingDocument.id, {
        category: editingDocument.category,
        theme: editingDocument.theme,
        description: editingDocument.description,
        tags: editingDocument.tags
      });
      setEditingDocument(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {availableThemes.length > 0 && (
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableThemes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Arquivo</label>
                  <Input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tema (opcional)</label>
                  <Input
                    value={uploadTheme}
                    onChange={(e) => setUploadTheme(e.target.value)}
                    placeholder="Ex: Treino A, Dieta Low Carb..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                  <Textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Descreva o conteúdo do documento..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (opcional)</label>
                  <Input
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="Separar por vírgula: exercicio, força, hipertrofia"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    className="flex-1"
                  >
                    {uploading ? <LoadingSpinner /> : 'Upload'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Selection Info */}
      {selectedDocuments.length > 0 && (
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm font-medium">
            {selectedDocuments.length} documento{selectedDocuments.length > 1 ? 's' : ''} selecionado{selectedDocuments.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => {
          const isSelected = selectedDocuments.some(d => d.id === document.id);
          const isEditing = editingDocument?.id === document.id;
          
          return (
            <Card 
              key={document.id} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${onDocumentSelect ? 'hover:shadow-md' : ''}`}
              onClick={() => !isEditing && handleDocumentClick(document)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(document.file_type)}
                    <span className="text-sm font-medium truncate">
                      {document.original_filename}
                    </span>
                    {onDocumentSelect && multiSelect && (
                      <Checkbox 
                        checked={isSelected}
                        className="ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDocument(document);
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja realmente excluir este documento?')) {
                          deleteDocument(document.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {isEditing ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Select 
                      value={editingDocument.category} 
                      onValueChange={(value) => setEditingDocument({...editingDocument, category: value})}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Tema"
                      value={editingDocument.theme || ''}
                      onChange={(e) => setEditingDocument({...editingDocument, theme: e.target.value})}
                      className="h-8"
                    />
                    
                    <Textarea
                      placeholder="Descrição"
                      value={editingDocument.description || ''}
                      onChange={(e) => setEditingDocument({...editingDocument, description: e.target.value})}
                      rows={2}
                    />
                    
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleUpdateDocument}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingDocument(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{CATEGORIES.find(c => c.value === document.category)?.label}</Badge>
                      {document.theme && <Badge variant="outline">{document.theme}</Badge>}
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    
                    {document.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {document.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatFileSize(document.file_size)}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(document.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum documento encontrado</p>
          {searchQuery && (
            <p className="text-sm mt-1">
              Tente ajustar os filtros ou fazer upload de novos documentos
            </p>
          )}
        </div>
      )}
    </div>
  );
};