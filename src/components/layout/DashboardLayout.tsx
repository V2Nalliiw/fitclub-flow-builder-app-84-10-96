
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
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top Bar */}
      <header className={cn(
        "h-16 border-b border-border bg-card px-6 flex items-center justify-between relative z-30",
        !isDesktop && isFlowsPage && "fixed top-0 left-0 right-0"
      )}>
        {/* Desktop Navigation */}
        {isDesktop ? (
          <DesktopHeaderNavigation />
        ) : isTablet ? (
          /* Tablet - Menu minimalista centralizado no topo */
          <>
            <div className="py-2">
              <img 
                src={currentLogo}
                alt="Logo" 
                className="h-12 w-auto max-w-[160px] object-contain"
              />
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
          </>
        ) : (
          /* Mobile - manter como estava */
          <>
            <div className="py-2">
              <img 
                src={currentLogo}
                alt="Logo" 
                className="h-12 w-auto max-w-[160px] object-contain"
              />
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
          </>
        )}
      </header>

      {/* Menu minimalista do tablet - posicionado no topo centralizado */}
      {isTablet && isFlowsPage && (
        <div className="fixed top-[calc(4rem+0.5rem)] left-1/2 transform -translate-x-1/2 z-40 bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Aqui será inserido o conteúdo do menu minimalista do tablet */}
            <div className="text-sm text-muted-foreground">Menu Tablet</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 animate-fade-in",
        !isDesktop && isFlowsPage ? "pt-0" : isMobile ? "pb-20" : "pb-6"
      )}>
        {children}
      </main>

      {/* Mobile Navigation - Show only on mobile */}
      {isMobile && <MobileNavigation />}
      
      {/* Drawer Menu - Show on mobile and tablet only */}
      {!isDesktop && <MobileDrawer />}
    </div>
  );
};
