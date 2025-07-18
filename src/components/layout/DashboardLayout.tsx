
import React, { useState } from 'react';
import { MobileNavigation } from './MobileNavigation';
import { MobileDrawer } from './MobileDrawer';
import { DesktopHeaderNavigation } from './DesktopHeaderNavigation';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { useLogoManager } from '@/hooks/useLogoManager';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { isDesktop, isMobile, isTablet } = useBreakpoints();
  const { currentLogo } = useLogoManager();
  
  const isFlowsPage = location.pathname === '/flows';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] flex flex-col w-full">
      {/* Top Bar - Header Fixo Fino para todos os usuários */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 flex items-center justify-between">
        {/* Desktop Navigation */}
        {isDesktop ? (
          <DesktopHeaderNavigation />
        ) : isTablet ? (
          /* Tablet - Menu minimalista centralizado no topo */
          <>
            <div className="py-1">
              <img 
                src={currentLogo}
                alt="Logo" 
                className="h-6 w-auto max-w-[80px] object-contain"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="h-8 w-8 p-1"
                >
                  <Bell className="h-3 w-3" />
                </Button>
                
                {notificationsOpen && (
                  <div className="absolute top-12 right-0 z-50">
                    <NotificationCenter onClose={() => setNotificationsOpen(false)} />
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </>
        ) : (
          /* Mobile - manter como estava */
          <>
            <div className="py-1">
              <img 
                src={currentLogo}
                alt="Logo" 
                className="h-6 w-auto max-w-[80px] object-contain"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="h-8 w-8 p-1"
                >
                  <Bell className="h-3 w-3" />
                </Button>
                
                {notificationsOpen && (
                  <div className="absolute top-12 right-0 z-50">
                    <NotificationCenter onClose={() => setNotificationsOpen(false)} />
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </>
        )}
      </header>

      {/* Main Content - Com espaçamento para header fixo */}
      <main className={cn(
        "pt-12 transition-all duration-300 animate-fade-in",
        isMobile || isTablet ? "pb-[10vh] min-h-[calc(100vh-3rem)]" : "flex-1 pb-6"
      )}>
        {children}
      </main>

      {/* Mobile Navigation - Show only on mobile - 10% da altura */}
      {(isMobile || isTablet) && (
        <div className="h-[10vh] min-h-[50px] shrink-0">
          <MobileNavigation />
        </div>
      )}
      
      {/* Drawer Menu - Show on mobile and tablet only */}
      {!isDesktop && <MobileDrawer />}
    </div>
  );
};
