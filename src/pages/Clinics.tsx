
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/ui/file-upload';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Search, Plus, Users, Settings, BarChart3, Edit, Trash2, Eye, User } from 'lucide-react';
import { useClinics } from '@/hooks/useClinics';
import { useAuth } from '@/contexts/AuthContext';

interface ClinicFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo: File[];
  // Dados do usuário responsável
  responsibleName: string;
  responsibleEmail: string;
  temporaryPassword: string;
  isChief: boolean;
}

export const Clinics = () => {
  const { user } = useAuth();
  const { clinics, loading, createClinic, deleteClinic } = useClinics();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: [],
    responsibleName: '',
    responsibleEmail: '',
    temporaryPassword: '',
    isChief: true
  });

  // Verificar se o usuário tem permissão para gerenciar clínicas
  if (user?.role !== 'super_admin') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas super administradores podem gerenciar clínicas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof ClinicFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-gerar slug baseado no nome
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, temporaryPassword: password }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      logo: [],
      responsibleName: '',
      responsibleEmail: '',
      temporaryPassword: '',
      isChief: true
    });
  };

  const handleAddClinic = async () => {
    if (!formData.name.trim() || !formData.slug.trim() || !formData.responsibleName.trim() || !formData.responsibleEmail.trim() || !formData.temporaryPassword.trim()) {
      return;
    }

    setCreating(true);
    try {
      const success = await createClinic({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        contact_email: formData.email,
        contact_phone: formData.phone,
        address: formData.address,
        responsibleUser: {
          name: formData.responsibleName,
          email: formData.responsibleEmail,
          password: formData.temporaryPassword,
          isChief: formData.isChief
        }
      });

      if (success) {
        setIsAddModalOpen(false);
        resetForm();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string, clinicName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a clínica "${clinicName}"?`)) {
      await deleteClinic(clinicId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Clínicas</h1>
          <p className="text-muted-foreground">Administre todas as clínicas do sistema</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Clínica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Clínica</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova clínica e seu usuário responsável
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Seção da Clínica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Dados da Clínica</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinic-name">Nome da Clínica *</Label>
                    <Input
                      id="clinic-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite o nome da clínica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic-slug">Slug *</Label>
                    <Input
                      id="clinic-slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="slug-da-clinica"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="clinic-description">Descrição</Label>
                  <Input
                    id="clinic-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Breve descrição da clínica"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinic-email">Email da Clínica</Label>
                    <Input
                      id="clinic-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@clinica.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic-phone">Telefone</Label>
                    <Input
                      id="clinic-phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clinic-address">Endereço</Label>
                  <Input
                    id="clinic-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <div>
                  <Label>Logo da Clínica</Label>
                  <FileUpload
                    onFilesChange={(files) => setFormData(prev => ({ ...prev, logo: files }))}
                    maxFiles={1}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                    className="mt-2"
                  />
                </div>
              </div>

              <Separator />

              {/* Seção do Usuário Responsável */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Usuário Responsável</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsible-name">Nome Completo *</Label>
                    <Input
                      id="responsible-name"
                      value={formData.responsibleName}
                      onChange={(e) => handleInputChange('responsibleName', e.target.value)}
                      placeholder="Nome completo do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible-email">Email de Login *</Label>
                    <Input
                      id="responsible-email"
                      type="email"
                      value={formData.responsibleEmail}
                      onChange={(e) => handleInputChange('responsibleEmail', e.target.value)}
                      placeholder="email@clinica.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <Label htmlFor="temporary-password">Senha Temporária *</Label>
                    <Input
                      id="temporary-password"
                      type="text"
                      value={formData.temporaryPassword}
                      onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
                      placeholder="Senha temporária"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateTemporaryPassword}
                  >
                    Gerar Senha
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Usuário Chefe da Clínica</Label>
                    <div className="text-sm text-muted-foreground">
                      Marque se este usuário será o chefe/administrador da clínica
                    </div>
                  </div>
                  <Switch
                    checked={formData.isChief}
                    onCheckedChange={(checked) => handleInputChange('isChief', checked)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddClinic} 
                disabled={creating || !formData.name.trim() || !formData.slug.trim() || !formData.responsibleName.trim() || !formData.responsibleEmail.trim() || !formData.temporaryPassword.trim()}
              >
                {creating ? 'Criando...' : 'Criar Clínica e Usuário'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{clinics.length}</p>
                <p className="text-sm text-muted-foreground">Clínicas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Fluxos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clínicas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clínicas</CardTitle>
          <CardDescription>
            Gerencie todas as clínicas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clínicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={clinic.logo_url} />
                      <AvatarFallback>
                        <Building2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{clinic.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {clinic.slug}
                      </p>
                      {clinic.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {clinic.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={clinic.is_active ? "default" : "secondary"}>
                          {clinic.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClinic(clinic.id, clinic.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClinics.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma clínica encontrada.' : 'Nenhuma clínica cadastrada ainda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
