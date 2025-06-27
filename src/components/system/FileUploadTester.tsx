
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

export const FileUploadTester = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{file: string, status: 'success' | 'error', message: string}[]>([]);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    setUploadResults([]);
  };

  const testUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Selecione pelo menos um arquivo para testar');
      return;
    }

    setIsUploading(true);
    const results: {file: string, status: 'success' | 'error', message: string}[] = [];

    for (const file of uploadedFiles) {
      try {
        // Simular upload - em produção isso seria enviado para Supabase Storage
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o arquivo é válido
        if (file.size > 5 * 1024 * 1024) {
          results.push({
            file: file.name,
            status: 'error', 
            message: 'Arquivo muito grande (>5MB)'
          });
        } else {
          results.push({
            file: file.name,
            status: 'success',
            message: `Upload simulado com sucesso (${(file.size / 1024).toFixed(1)}KB)`
          });
        }
      } catch (error) {
        results.push({
          file: file.name,
          status: 'error',
          message: 'Erro no upload'
        });
      }
    }

    setUploadResults(results);
    setIsUploading(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    if (successCount > 0) {
      toast.success(`${successCount} arquivo(s) testado(s) com sucesso`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Teste de Upload de Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          onFilesChange={handleFilesChange}
          maxFiles={3}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'text/*': ['.txt', '.csv']
          }}
        />

        {uploadedFiles.length > 0 && (
          <Button 
            onClick={testUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Testando Upload...' : `Testar Upload (${uploadedFiles.length} arquivo(s))`}
          </Button>
        )}

        {uploadResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados do Teste:</h4>
            {uploadResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                {result.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{result.file}</span>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
