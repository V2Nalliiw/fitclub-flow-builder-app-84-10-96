
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, GitBranch, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const MobileNavigation = () => {
  const { user } = useAuth();

  const getMainNavItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Building2, label: 'Clínicas', href: '/clinics' },
          { icon: User, label: 'Perfil', href: '/profile' },
        ];
      case 'clinic':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Users, label: 'Pacientes', href: '/patients' },
          { icon: GitBranch, label: 'Fluxos', href: '/flows' },
          { icon: User, label: 'Perfil', href: '/profile' },
        ];
      case 'patient':
        return [
          { icon: Home, label: 'Início', href: '/dashboard' },
          { icon: User, label: 'Perfil', href: '/profile' },
        ];
      default:
        return [];
    }
  };

  const mainNavItems = getMainNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[64px]",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "text-primary bg-primary/10"
              )
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
