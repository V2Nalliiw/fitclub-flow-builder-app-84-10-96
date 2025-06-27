
import { ReactNode } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface RealtimeNotificationProviderProps {
  children: ReactNode;
}

export const RealtimeNotificationProvider = ({ children }: RealtimeNotificationProviderProps) => {
  useRealtimeNotifications();
  return <>{children}</>;
};
