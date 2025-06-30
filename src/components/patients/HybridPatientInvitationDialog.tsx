
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useHybridPatientInvitations } from '@/hooks/useHybridPatientInvitations';
import { Plus, Search, User, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const HybridPatientInvitationDialog = () => {
  const [open, setOpen] = useState(false);
  const [inviteExisting, setInviteExisting] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    expiresInDays: 7,
  });

  const {
    existingPatients,
    isCreating,
    isSearching,
    searchExistingPatients,
    inviteExistingPatient,
    inviteNewPatient,
  } = useHybridPatientInvitations();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchExistingPatients(value);
    setSelectedPatient(null);
  };

  const handleExistingPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      return;
    }
    
    const success = await inviteExistingPatient(selectedPatient);
    
    if (success) {
      setSearchTerm('');
      setSelectedPatient(null);
      setOpen(false);
    }
  };

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await inviteNewPatient({
      name: newPatientData.name,
      email: newPatientData.email,
      phone: newPatientData.phone || undefined,
      expiresInDays: newPatientData.expiresInDays,
    });
    
    if (success) {
      setNewPatientData({ name: '', email: '', phone: '', expiresInDays: 7 });
      setOpen(false);
    }
  };

  const resetDialog = () => {
    setSearchTerm('');
    setSelectedPatient(null);
    setNewPatientData({ name: '', email: '', phone: '', expiresInDays: 7 });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Convidar Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Paciente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Toggle para tipo de convite */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {inviteExisting ? 'Paciente Existente' : 'Novo Paciente'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {inviteExisting 
                  ? 'Convidar alguém já cadastrado na plataforma' 
                  : 'Convidar alguém que ainda não tem conta'
                }
              </p>
            </div>
            <Switch
              checked={inviteExisting}
              onCheckedChange={setInviteExisting}
            />
          </div>

          {inviteExisting ? (
            // Formulário para paciente existente
            <form onSubmit={handleExistingPatientSubmit} className="space-y-4">
              <div>
                <Label htmlFor="search">Buscar Paciente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Digite nome ou email do paciente..."
                    className="pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de pacientes encontrados */}
              {existingPatients.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <Label className="text-sm">Pacientes encontrados:</Label>
                  {existingPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.email}</p>
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <Badge variant="default" className="text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && existingPatients.length === 0 && !isSearching && (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum paciente encontrado</p>
                  <p className="text-xs">Tente buscar por nome ou email</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!selectedPatient || isCreating}>
                  {isCreating ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </div>
            </form>
          ) : (
            // Formulário para novo paciente
            <form onSubmit={handleNewPatientSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                    placeholder="Digite o nome do paciente"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expires">Expira em</Label>
                <Select
                  value={newPatientData.expiresInDays.toString()}
                  onValueChange={(value) => setNewPatientData({ ...newPatientData, expiresInDays: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
