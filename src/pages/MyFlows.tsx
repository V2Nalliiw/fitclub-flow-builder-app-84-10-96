
import { FlowsList } from '@/components/flows/FlowsList';
import { useAuth } from '@/contexts/AuthContext';
import { MobileErrorBoundary } from '@/components/ui/mobile-error-boundary';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEffect } from 'react';

const MyFlows = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Add meta tag to prevent Google Translate interference
    const metaTag = document.createElement('meta');
    metaTag.name = 'google';
    metaTag.content = 'notranslate';
    document.head.appendChild(metaTag);

    // Cleanup function
    return () => {
      const existingMeta = document.querySelector('meta[name="google"]');
      if (existingMeta) {
        document.head.removeChild(existingMeta);
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <MobileErrorBoundary>
        <FlowsList />
      </MobileErrorBoundary>
    </DashboardLayout>
  );
};

export default MyFlows;
