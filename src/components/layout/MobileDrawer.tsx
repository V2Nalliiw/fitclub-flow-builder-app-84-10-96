
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  User, 
  Building2, 
  GitBranch,
  UserCog,
  Palette,
  BarChart3,
  Shield,
  FileText,
  ChevronUp,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export const MobileDrawer = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const getAllNavItems = () => {
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

  const allNavItems = getAllNavItems();

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg md:hidden animate-bounce">
          <ChevronUp className="h-5 w-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Menu</DrawerTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        <div className="px-4 pb-8">
          {user && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          )}
          
          <div className="grid gap-2">
            {allNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-destructive hover:bg-destructive/10 mt-4"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
