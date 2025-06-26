
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  type?: 'list' | 'card' | 'table' | 'form';
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  type = 'list', 
  count = 3, 
  className 
}: LoadingSkeletonProps) => {
  const renderListSkeleton = () => (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={cn("space-y-4", className)}>
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  switch (type) {
    case 'card':
      return renderCardSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'form':
      return renderFormSkeleton();
    default:
      return renderListSkeleton();
  }
};

export default LoadingSkeleton;
