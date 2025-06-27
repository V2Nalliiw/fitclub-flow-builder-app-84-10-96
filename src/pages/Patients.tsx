
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Search, Edit, Trash2, Eye, UserPlus, MoreVertical } from 'lucide-react';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import { usePatients } from '@/hooks/usePatients';
import { useAuth } from '@/contexts/AuthContext';

export const Patients = () => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useBreakpoints();
  const { patients, loading, addPatient, updatePatient, deletePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Verificar se o usuário tem permissão para gerenciar pacientes
  if (user?.role !== 'clinic') {
    return (
      <div className="container mx-auto py-6 text-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Apenas clínicas podem gerenciar pacientes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const handleInputChange = (field: string, value: string) => {
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
    });
  };

  const handleAddPatient = async () => {
    if (!formData.name || !formData.email) {
      return;
    }

    setFormLoading(true);
    
    const success = await addPatient(formData);
    
    if (success) {
      setIsAddModalOpen(false);
      resetForm();
    }
    
    setFormLoading(false);
  };

  const handleEditPatient = async () => {
    if (!selectedPatient || !formData.name || !formData.email) {
      return;
    }

    setFormLoading(true);
    
    const success = await updatePatient(selectedPatient.id, formData);
    
    if (success) {
      setIsEditModalOpen(false);
      setSelectedPatient(null);
      resetForm();
    }
    
    setFormLoading(false);
  };

  const handleDeletePatient = async (patientId: string) => {
    setFormLoading(true);
    await deletePatient(patientId);
    setFormLoading(false);
  };

  const openEditModal = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const renderMobileTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPatients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={patient.avatar_url} />
                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{patient.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">Ativo</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm font-medium border-b">
                      Informações do Paciente
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm">{patient.email}</div>
                    </div>
                    {patient.phone && (
                      <div className="px-3 py-1">
                        <div className="text-xs text-muted-foreground">Telefone</div>
                        <div className="text-sm">{patient.phone}</div>
                      </div>
                    )}
                    <div className="px-3 py-1">
                      <div className="text-xs text-muted-foreground">Cadastrado em</div>
                      <div className="text-sm">{new Date(patient.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => openEditModal(patient)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Paciente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o paciente "{patient.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePatient(patient.id)}
                              className="bg-destructive text-destructive-foreground"
                              disabled={formLoading}
                            >
                              {formLoading ? 'Removendo...' : 'Remover'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDesktopTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Cadastrado em</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPatients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={patient.avatar_url} />
                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{patient.name}</span>
              </div>
            </TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>{patient.phone || '-'}</TableCell>
            <TableCell>
              {new Date(patient.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">Ativo</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(patient)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Paciente</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover o paciente "{patient.name}"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePatient(patient.id)}
                        className="bg-destructive text-destructive-foreground"
                        disabled={formLoading}
                      >
                        {formLoading ? 'Removendo...' : 'Remover'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 space-y-6 ${isMobile ? 'px-3' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie os pacientes da clínica</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? 'Adicionar' : 'Adicionar Paciente'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Paciente</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo paciente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-name">Nome Completo</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-phone">Telefone</Label>
                <Input
                  id="add-phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPatient} disabled={formLoading}>
                {formLoading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lista de Pacientes
          </CardTitle>
          <CardDescription>
            {patients.length} paciente(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isMobile || isTablet ? renderMobileTable() : renderDesktopTable()}

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPatient} disabled={formLoading}>
              {formLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
