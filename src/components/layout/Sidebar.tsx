import {
  LayoutDashboard,
  User,
  GitBranch,
  Workflow,
  Settings,
  Users,
  LucideIcon,
  Cog,
  MessagesSquare,
  HelpCircle,
  Building2,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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

    // Navegação específica para pacientes
    if (user.role === 'patient') {
      return [
        ...baseItems,
        {
          title: "Perfil",
          url: "/profile",
          icon: User,
        },
      ];
    }

    // Navegação para super_admin
    if (user.role === 'super_admin') {
      return [
        ...baseItems,
        {
          title: "Clínicas",
          url: "/clinics",
          icon: Building2,
        },
        {
          title: "Configurações",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "WhatsApp",
          url: "/whatsapp-settings",
          icon: MessagesSquare,
        },
      ];
    }

    // Navegação para clínicas
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
        title: "WhatsApp",
        url: "/whatsapp-settings",
        icon: MessagesSquare,
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
    <SidebarComponent>
      <SidebarContent className="flex flex-col">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg">
              {user?.name || 'Painel'}
            </h1>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                variant={location.pathname === item.url ? "outline" : "default"}
                isActive={location.pathname === item.url}
                onClick={() => navigate(item.url)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Ações</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/settings')}>
                <Cog className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md p-2 hover:bg-secondary">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="theme"
              checked={theme === "dark"}
              onCheckedChange={() => toggleTheme()}
            />
            <Label htmlFor="theme" className="text-sm">
              Modo {theme === "dark" ? "Escuro" : "Claro"}
            </Label>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </SidebarComponent>
  );
};
