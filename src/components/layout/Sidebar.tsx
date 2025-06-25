
import React from 'react';
import { 
  Home, 
  Users, 
  Settings, 
  User, 
  Building2, 
  GitBranch,
  UserCog,
  Shield,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();

  const getSidebarItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Building2, label: 'Gerenciar Clínicas', href: '/clinics' },
          { icon: UserCog, label: 'Colaboradores', href: '/team' },
          { icon: Palette, label: 'Personalização', href: '/customization' },
          { icon: Settings, label: 'Preferências', href: '/preferences' },
          { icon: User, label: 'Editar Perfil', href: '/profile' },
        ];
      case 'clinic':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Users, label: 'Pacientes', href: '/patients' },
          { icon: GitBranch, label: 'Fluxos', href: '/flows' },
          { icon: UserCog, label: 'Colaboradores', href: '/team' },
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
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
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
            <Shield className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10",
                isCollapsed && "px-2"
              )}
              onClick={() => console.log(`Navigate to ${item.href}`)}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-border">
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
