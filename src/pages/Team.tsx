
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, UserPlus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'therapist' | 'assistant';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  invited_at: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao@clinica.com',
    role: 'admin',
    status: 'active',
    avatar: '',
    invited_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@clinica.com',
    role: 'therapist',
    status: 'active',
    avatar: '',
    invited_at: '2024-01-15T14:00:00Z'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@clinica.com',
    role: 'assistant',
    status: 'pending',
    avatar: '',
    invited_at: '2024-01-20T09:00:00Z'
  }
];

export const Team = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'assistant' as TeamMember['role'],
  });

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setInviteData({
      name: '',
      email: '',
      role: 'assistant',
    });
  };

  const handleInviteMember = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteData.name,
        email: inviteData.email,
        role: inviteData.role,
        status: 'pending',
        avatar: '',
        invited_at: new Date().toISOString()
      };

      setTeamMembers(prev => [...prev, newMember]);
      setIsInviteModalOpen(false);
      resetForm();
      
      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${inviteData.email}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (memberId: string, email: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Convite reenviado",
        description: `Convite reenviado para ${email}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o convite.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    const roleConfig = {
      admin: { label: 'Administrador', variant: 'default' as const },
      therapist: { label: 'Terapeuta', variant: 'secondary' as const },
      assistant: { label: 'Assistente', variant: 'outline' as const },
    };

    return (
      <Badge variant={roleConfig[role].variant}>
        {roleConfig[role].label}
      </Badge>
    );
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      inactive: { label: 'Inativo', variant: 'destructive' as const },
    };

    return (
      <Badge variant={statusConfig[status].variant}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const getPageTitle = () => {
    return user?.role === 'super_admin' ? 'Colaboradores' : 'Equipe da Clínica';
  };

  const getPageDescription = () => {
    return user?.role === 'super_admin' 
      ? 'Gerencie colaboradores de todas as clínicas'
      : 'Gerencie a equipe da sua clínica';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo membro da equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-name">Nome Completo</Label>
                <Input
                  id="invite-name"
                  value={inviteData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Função</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">Assistente</SelectItem>
                    <SelectItem value="therapist">Terapeuta</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleInviteMember} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            {teamMembers.length} membro(s) na equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Convidado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    {new Date(member.invited_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {member.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResendInvite(member.id, member.email)}
                          title="Reenviar convite"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum membro encontrado.' : 'Nenhum membro na equipe ainda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
