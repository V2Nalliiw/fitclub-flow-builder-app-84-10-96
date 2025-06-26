
import React from 'react';
import { 
  Home, 
  Users, 
  Settings, 
  User, 
  Building2, 
  GitBranch,
  UserCog,
  Palette,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getSidebarItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Building2, label: 'Gerenciar Clínicas', href: '/clinics' },
          { icon: UserCog, label: 'Colaboradores', href: '/team' },
          { icon: BarChart3, label: 'Analytics', href: '/analytics' },
          { icon: Shield, label: 'Permissões', href: '/permissions' },
          { icon: Palette, label: 'Personalização', href: '/customization' },
          { icon: Settings, label: 'Preferências', href: '/preferences' },
          { icon: User, label: 'Editar Perfil', href: '/profile' },
        ];
      case 'clinic':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Users, label: 'Pacientes', href: '/patients' },
          { icon: GitBranch, label: 'Fluxos', href: '/flows' },
          { icon: FileText, label: 'Formulários', href: '/forms' },
          { icon: BarChart3, label: 'Analytics', href: '/analytics' },
          { icon: UserCog, label: 'Colaboradores', href: '/team' },
          { icon: Shield, label: 'Permissões', href: '/permissions' },
          { icon: Settings, label: 'Configurações', href: '/settings' },
          { icon: User, label: 'Editar Perfil', href: '/profile' },
        ];
      case 'patient':
        return [
          { icon: Home, label: 'Início', href: '/dashboard' },
          { icon: User, label: 'Meu Perfil', href: '/profile' },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <img 
              src="/lovable-uploads/09cb65b5-4986-4722-af8b-77c3ee47d7d5.png" 
              alt="FitClub" 
              className="h-8"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center w-full h-10 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                  isCollapsed && "justify-center"
                )
              }
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info & Logout - Fixed at bottom */}
      <div className="p-2 border-t border-border flex-shrink-0">
        {!isCollapsed && user && (
          <div className="px-2 py-1 mb-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-destructive hover:text-destructive"
          onClick={logout}
        >
          <Settings className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};
