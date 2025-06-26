
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'patients' | 'flows' | 'reports' | 'settings' | 'team';
  actions: ('read' | 'write' | 'delete' | 'execute')[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastAccess: string;
  status: 'active' | 'inactive';
}

// Mock data
const mockPermissions: Permission[] = [
  {
    id: 'patients_read',
    name: 'Visualizar Pacientes',
    description: 'Ver lista e detalhes dos pacientes',
    category: 'patients',
    actions: ['read']
  },
  {
    id: 'patients_write',
    name: 'Gerenciar Pacientes',
    description: 'Criar e editar dados dos pacientes',
    category: 'patients',
    actions: ['read', 'write']
  },
  {
    id: 'flows_execute',
    name: 'Executar Fluxos',
    description: 'Iniciar e gerenciar execuções de fluxos',
    category: 'flows',
    actions: ['read', 'execute']
  },
  {
    id: 'reports_view',
    name: 'Visualizar Relatórios',
    description: 'Acessar dashboard e relatórios',
    category: 'reports',
    actions: ['read']
  },
  {
    id: 'settings_manage',
    name: 'Gerenciar Configurações',
    description: 'Alterar configurações da clínica',
    category: 'settings',
    actions: ['read', 'write']
  }
];

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso completo a todas as funcionalidades',
    permissions: mockPermissions.map(p => p.id),
    isDefault: true,
    userCount: 2
  },
  {
    id: 'therapist',
    name: 'Fisioterapeuta',
    description: 'Acesso aos pacientes e fluxos',
    permissions: ['patients_read', 'patients_write', 'flows_execute', 'reports_view'],
    isDefault: true,
    userCount: 8
  },
  {
    id: 'assistant',
    name: 'Assistente',
    description: 'Acesso limitado para visualização',
    permissions: ['patients_read', 'reports_view'],
    isDefault: false,
    userCount: 3
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao@clinica.com',
    role: 'admin',
    lastAccess: '2024-01-20T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@clinica.com',
    role: 'therapist',
    lastAccess: '2024-01-20T09:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@clinica.com',
    role: 'assistant',
    lastAccess: '2024-01-19T16:45:00Z',
    status: 'inactive'
  }
];

export const PermissionManager = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patients': return <Users className="h-4 w-4" />;
      case 'flows': return <FileText className="h-4 w-4" />;
      case 'reports': return <BarChart3 className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      case 'team': return <UserCheck className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrador': return 'destructive';
      case 'fisioterapeuta': return 'default';
      case 'assistente': return 'secondary';
      default: return 'outline';
    }
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do papel é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const newRole: Role = {
      id: Date.now().toString(),
      name: newRoleName,
      description: newRoleDescription,
      permissions: newRolePermissions,
      isDefault: false,
      userCount: 0
    };

    setRoles([...roles, newRole]);
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRolePermissions([]);
    setIsCreateRoleOpen(false);

    toast({
      title: "Papel criado",
      description: `${newRoleName} foi criado com sucesso`,
    });
  };

  const togglePermission = (permissionId: string) => {
    if (newRolePermissions.includes(permissionId)) {
      setNewRolePermissions(prev => prev.filter(id => id !== permissionId));
    } else {
      setNewRolePermissions(prev => [...prev, permissionId]);
    }
  };

  const changeUserRole = (userId: string, newRole: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    toast({
      title: "Papel alterado",
      description: "O papel do usuário foi atualizado com sucesso",
    });
  };

  const groupedPermissions = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Permissões</h1>
          <p className="text-muted-foreground">Controle de acesso e papéis dos usuários</p>
        </div>
        
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Papel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Papel</DialogTitle>
              <DialogDescription>
                Defina um novo papel e suas permissões
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Nome do Papel</Label>
                  <Input
                    id="role-name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Ex: Supervisor"
                  />
                </div>
                <div>
                  <Label htmlFor="role-description">Descrição</Label>
                  <Input
                    id="role-description"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Breve descrição do papel"
                  />
                </div>
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="mt-2 space-y-4">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryIcon(category)}
                        <h4 className="font-medium capitalize">{category}</h4>
                      </div>
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                              checked={newRolePermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRole}>
                Criar Papel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Papéis</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {role.isDefault && (
                        <Badge variant="outline">Padrão</Badge>
                      )}
                      <Badge variant="secondary">{role.userCount} usuários</Badge>
                    </div>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Permissões ({role.permissions.length})</p>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 3).map((permissionId) => {
                          const permission = mockPermissions.find(p => p.id === permissionId);
                          return permission ? (
                            <div key={permissionId} className="flex items-center gap-2 text-sm">
                              {getCategoryIcon(permission.category)}
                              <span className="text-muted-foreground">{permission.name}</span>
                            </div>
                          ) : null;
                        })}
                        {role.permissions.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{role.permissions.length - 3} mais permissões
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isDefault && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários e Papéis</CardTitle>
              <CardDescription>
                Gerencie os papéis dos usuários da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Último acesso: {new Date(user.lastAccess).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                      >
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      
                      <Select 
                        value={user.role} 
                        onValueChange={(value) => changeUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <CardTitle className="capitalize">{category}</CardTitle>
                  </div>
                  <CardDescription>
                    Permissões relacionadas a {category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                        <div className="flex gap-1">
                          {permission.actions.map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
