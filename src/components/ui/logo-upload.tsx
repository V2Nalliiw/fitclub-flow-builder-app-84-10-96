
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentLogo?: string;
  uploading?: boolean;
  className?: string;
  label?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  onUpload,
  currentLogo,
  uploading = false,
  className,
  label = 'Logo'
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-accent/50",
          isDragActive && "border-primary bg-accent/50",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {currentLogo ? (
          <div className="space-y-4">
            <img
              src={currentLogo}
              alt="Logo atual"
              className="h-16 w-auto mx-auto object-contain"
            />
            <div className="text-sm text-muted-foreground">
              {uploading ? 'Enviando...' : 'Clique ou arraste para alterar'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Enviando...' : (isDragActive ? 'Solte o arquivo aqui' : 'Clique ou arraste o logo')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF, WebP ou SVG até 5MB
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
