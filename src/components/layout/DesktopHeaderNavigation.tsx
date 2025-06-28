
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
  MessagesSquare,
  Building2,
  UserPlus,
  HelpCircle,
  LogOut,
  Bell,
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
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

export const DesktopHeaderNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

    if (user.role === 'super_admin') {
      return [
        ...baseItems,
        {
          title: "Clínicas",
          url: "/clinics",
          icon: Building2,
        },
        {
          title: "WhatsApp",
          url: "/whatsapp-settings",
          icon: MessagesSquare,
        },
      ];
    }

    if (user.role === 'patient') {
      return [
        ...baseItems,
        {
          title: "Dicas e Formulários",
          url: "/my-flows",
          icon: FileText,
        },
      ];
    }

    // Para clínicas
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
        title: "Equipe",
        url: "/team",
        icon: UserPlus,
      },
    ];
  };

  const getUserMenuItems = () => {
    if (!user) return [];

    const baseMenuItems = [
      {
        title: "Perfil",
        icon: User,
        action: () => navigate('/profile'),
      },
      {
        title: "Ajuda",
        icon: HelpCircle,
        action: () => navigate('/help'),
      },
    ];

    if (user.role === 'super_admin') {
      return [
        ...baseMenuItems.slice(0, 1), // Perfil
        {
          title: "Configurações do App",
          icon: Settings,
          action: () => navigate('/settings'),
        },
        ...baseMenuItems.slice(1), // Ajuda
      ];
    }

    if (user.role === 'clinic') {
      return [
        ...baseMenuItems.slice(0, 1), // Perfil
        {
          title: "Configurações da Clínica",
          icon: Settings,
          action: () => navigate('/settings'),
        },
        ...baseMenuItems.slice(1), // Ajuda
      ];
    }

    // Para pacientes, apenas perfil e ajuda
    return baseMenuItems;
  };

  const navigationItems = getNavigationItems();
  const userMenuItems = getUserMenuItems();

  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo à esquerda */}
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/f205f390-c668-44cc-9a73-ee3d49cb0a6c.png" 
          alt="FitClub" 
          className="h-8 w-8"
        />
      </div>

      {/* Navegação e controles à direita */}
      <div className="flex items-center gap-2">
        {/* Ícones de navegação */}
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

        {/* Botão de tema (dark mode) - primeiro da direita para esquerda */}
        <ThemeToggle />

        {/* Notificações - segundo da direita para esquerda */}
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

        {/* Menu do usuário (avatar) - terceiro da direita para esquerda */}
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
            {userMenuItems.map((item, index) => (
              <DropdownMenuItem key={item.title} onClick={item.action}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </DropdownMenuItem>
            ))}
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
