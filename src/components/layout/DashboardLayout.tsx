
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { MobileDrawer } from './MobileDrawer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo apenas no mobile, sem funcionalidade de menu */}
            <div className="md:hidden">
              <img 
                src="/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png" 
                alt="FitClub" 
                className="h-8 w-8"
              />
            </div>
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
          "flex-1 transition-all duration-300 pb-20 md:pb-6",
          "animate-fade-in"
        )}>
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
      <MobileDrawer />
    </div>
  );
};
