
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName = 'User',
  className,
  size = 'md'
}) => {
  const { uploadAvatar, uploading } = useAvatarUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await uploadAvatar(acceptedFiles[0]);
    }
  }, [uploadAvatar]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer transition-all duration-200",
          isDragActive && "scale-105"
        )}
      >
        <input {...getInputProps()} />
        <Avatar className={cn(sizeClasses[size], "border-2 border-dashed border-transparent group-hover:border-primary")}>
          <AvatarImage src={currentAvatar} alt={userName} />
          <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
          uploading && "opacity-100"
        )}>
          {uploading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
        </div>
      </div>
      
      {isDragActive && (
        <div className="absolute -inset-2 border-2 border-dashed border-primary rounded-full bg-primary/10" />
      )}
    </div>
  );
};
