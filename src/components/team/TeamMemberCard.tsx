import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserMinus, Settings, MessageCircle } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamManagement';

interface TeamMemberCardProps {
  member: TeamMember;
  roleLabels: Record<string, string>;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => void;
  onUpdatePermissions: (memberId: string, permissions: Record<string, boolean>) => void;
  onDeactivate: (memberId: string) => void;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'manager':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'professional':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'assistant':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'viewer':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  roleLabels,
  onUpdateRole,
  onUpdatePermissions,
  onDeactivate
}) => {
  const handleRoleChange = (newRole: TeamMember['role']) => {
    onUpdateRole(member.id, newRole);
  };

  const handleDeactivate = () => {
    if (window.confirm(`Tem certeza que deseja remover ${member.user_profile?.name} da equipe?`)) {
      onDeactivate(member.id);
    }
  };

  return (
    <Card className="border-2" style={{ borderColor: 'hsl(var(--border))' }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.user_profile?.avatar_url} />
              <AvatarFallback>
                {member.user_profile?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{member.user_profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{member.user_profile?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getRoleColor(member.role)}>
              {roleLabels[member.role]}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {}}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Permissões
                </DropdownMenuItem>
                
                {member.whatsapp_phone && (
                  <DropdownMenuItem onClick={() => {}}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Alterar Cargo</DropdownMenuLabel>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <DropdownMenuItem 
                    key={role}
                    onClick={() => handleRoleChange(role as TeamMember['role'])}
                    disabled={member.role === role}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleDeactivate}
                  className="text-destructive focus:text-destructive"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remover da Equipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {member.whatsapp_phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">WhatsApp:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{member.whatsapp_phone}</span>
                {member.whatsapp_verified && (
                  <Badge variant="outline" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Membro desde:</span>
            <span className="text-sm">
              {new Date(member.joined_at || member.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};