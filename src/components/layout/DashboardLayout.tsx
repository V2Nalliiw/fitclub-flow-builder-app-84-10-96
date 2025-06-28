
import React, { useState } from 'react';
import { MobileNavigation } from './MobileNavigation';
import { MobileDrawer } from './MobileDrawer';
import { DesktopHeaderNavigation } from './DesktopHeaderNavigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { useLocation } from 'react-router-dom';
import { useBreakpoints } from '@/hooks/use-breakpoints';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { isDesktop } = useBreakpoints();
  
  const isFlowsPage = location.pathname === '/flows';

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top Bar */}
      <header className={cn(
        "h-16 border-b border-border bg-card px-6 flex items-center justify-between relative z-30",
        !isDesktop && isFlowsPage && "fixed top-0 left-0 right-0"
      )}>
        <div className="flex items-center gap-4 flex-1">
          {/* Desktop Navigation */}
          {isDesktop ? (
            <DesktopHeaderNavigation />
          ) : (
            /* Mobile/Tablet Logo */
            <div>
              <img 
                src="/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png" 
                alt="FitClub" 
                className="h-8 w-8"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            {notificationsOpen && (
              <div className="absolute top-12 right-0 z-50">
                <NotificationCenter onClose={() => setNotificationsOpen(false)} />
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 animate-fade-in",
        !isDesktop && isFlowsPage ? "pt-0" : "pb-20 md:pb-6"
      )}>
        {children}
      </main>

      {/* Mobile/Tablet Navigation - Show on mobile and tablet */}
      {!isDesktop && (
        <>
          <MobileNavigation />
          <MobileDrawer />
        </>
      )}
    </div>
  );
};
