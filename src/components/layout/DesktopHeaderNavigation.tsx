
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  User,
  GitBranch,
  Workflow,
  Settings,
  Users,
  Activity,
  MessagesSquare,
  Calendar,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const DesktopHeaderNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ];

    if (user.role === 'patient') {
      return [
        ...baseItems,
        {
          title: "Dicas e Formulários",
          url: "/my-flows",
          icon: FileText,
        },
        {
          title: "Perfil",
          url: "/profile",
          icon: User,
        },
      ];
    }

    // For clinics and professionals
    return [
      ...baseItems,
      {
        title: "Meus Fluxos",
        url: "/my-flows",
        icon: GitBranch,
      },
      {
        title: "Construtor de Fluxos",
        url: "/flows",
        icon: Workflow,
      },
      {
        title: "Pacientes",
        url: "/patients",
        icon: Users,
      },
      {
        title: "Formulários",
        url: "/forms",
        icon: FileText,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: Activity,
      },
      {
        title: "WhatsApp",
        url: "/whatsapp-settings",
        icon: MessagesSquare,
      },
      {
        title: "Agendamentos",
        url: "/appointments",
        icon: Calendar,
      },
      {
        title: "Configurações",
        url: "/settings",
        icon: Settings,
      },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex items-center gap-2">
      {/* Logo */}
      <div className="mr-4">
        <img 
          src="/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png" 
          alt="FitClub" 
          className="h-8 w-8"
        />
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-1">
        {navigationItems.map((item) => (
          <Button
            key={item.title}
            variant={location.pathname === item.url ? "secondary" : "ghost"}
            size="icon"
            onClick={() => navigate(item.url)}
            className={cn(
              "h-10 w-10",
              location.pathname === item.url && "bg-primary/10 text-primary"
            )}
            title={item.title}
          >
            <item.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      {/* User Menu */}
      <div className="ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
