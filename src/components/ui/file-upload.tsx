
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  className,
  preview = true
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-accent/50",
          isDragActive && "border-primary bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo {maxFiles} arquivo(s) de até {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </Card>

      {preview && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={index} className="relative p-2">
              <div className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-xs text-center mt-2 truncate">{file.name}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
