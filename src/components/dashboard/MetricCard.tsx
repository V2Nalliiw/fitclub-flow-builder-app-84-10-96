
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change,
  isLoading 
}: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          {change && <Skeleton className="h-3 w-20" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${
            change.value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
