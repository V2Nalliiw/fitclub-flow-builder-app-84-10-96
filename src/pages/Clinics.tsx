
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Search, Plus, Users, Settings, BarChart3, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Clinic } from '@/types';

// Mock data expandido
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Clínica Fisio+',
    logo: '',
    chief_user_id: 'user-1',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Centro de Reabilitação Vida',
    logo: '',
    chief_user_id: 'user-2',
    created_at: '2024-01-15T14:00:00Z'
  },
  {
    id: '3',
    name: 'Clínica Movimento',
    logo: '',
    chief_user_id: 'user-3',
    created_at: '2024-01-20T09:00:00Z'
  }
];

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  chiefName: string;
  chiefEmail: string;
  logo: File[];
}

export const Clinics = () => {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    chiefName: '',
    chiefEmail: '',
    logo: []
  });

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof ClinicFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      chiefName: '',
      chiefEmail: '',
      logo: []
    });
  };

  const handleAddClinic = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newClinic: Clinic = {
        id: Date.now().toString(),
        name: formData.name,
        logo: formData.logo.length > 0 ? URL.createObjectURL(formData.logo[0]) : '',
        chief_user_id: Date.now().toString(),
        created_at: new Date().toISOString()
      };

      setClinics(prev => [...prev, newClinic]);
      setIsAddModalOpen(false);
      resetForm();
      
      toast({
        title: "Clínica adicionada",
        description: `${formData.name} foi criada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a clínica.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string, clinicName: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClinics(prev => prev.filter(clinic => clinic.id !== clinicId));
      toast({
        title: "Clínica removida",
        description: `${clinicName} foi removida do sistema.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a clínica.",
        variant: "destructive",
      });
    }
  };

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Clínica</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova clínica no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic-name">Nome da Clínica</Label>
                  <Input
                    id="clinic-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome da clínica"
                  />
                </div>
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic-phone">Telefone</Label>
                  <Input
                    id="clinic-phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chief-name">Nome do Responsável</Label>
                  <Input
                    id="chief-name"
                    value={formData.chiefName}
                    onChange={(e) => handleInputChange('chiefName', e.target.value)}
                    placeholder="Nome do administrador"
                  />
                </div>
                <div>
                  <Label htmlFor="chief-email">Email do Responsável</Label>
                  <Input
                    id="chief-email"
                    type="email"
                    value={formData.chiefEmail}
                    onChange={(e) => handleInputChange('chiefEmail', e.target.value)}
                    placeholder="admin@clinica.com"
                  />
                </div>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddClinic} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Clínica'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                <p className="text-2xl font-bold">156</p>
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
                <p className="text-2xl font-bold">23</p>
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
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                      <AvatarImage src={clinic.logo} />
                      <AvatarFallback>
                        <Building2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{clinic.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Criada em {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="default">Ativa</Badge>
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
