import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { MoreVertical, User, Phone, Mail, Shield, Settings, UserMinus } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamManagement';

interface TeamMemberCardProps {
  member: TeamMember;
  roleLabels: Record<string, string>;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  onUpdatePermissions: (memberId: string, permissions: Record<string, boolean>) => Promise<void>;
  onDeactivate: (memberId: string) => Promise<void>;
}

export const TeamMemberCard = ({ 
  member, 
  roleLabels, 
  onUpdateRole, 
  onUpdatePermissions, 
  onDeactivate 
}: TeamMemberCardProps) => {
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'professional': return 'secondary';
      case 'assistant': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={member.user_profile?.avatar_url} />
            <AvatarFallback>
              {member.user_profile?.name ? getInitials(member.user_profile.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{member.user_profile?.name || 'Nome não disponível'}</h4>
            <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
              {roleLabels[member.role]}
            </Badge>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar Permissões
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Permissões de {member.user_profile?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Funcionalidade de gerenciamento de permissões será implementada.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => onDeactivate(member.id)}
              className="text-destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remover da Equipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-3 w-3 mr-2" />
            {member.user_profile?.email || 'Email não disponível'}
          </div>
          
          {member.whatsapp_phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              {member.whatsapp_phone}
              {member.whatsapp_verified && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Verificado
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-3 w-3 mr-2" />
            Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};