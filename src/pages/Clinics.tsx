
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Search, Plus, Users, Settings, BarChart3 } from 'lucide-react';
import { Clinic } from '@/types';

// Mock data
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
  }
];

export const Clinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Clínicas</h1>
          <p className="text-muted-foreground">Administre todas as clínicas do sistema</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Clínica
        </Button>
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
                        <Badge variant="secondary">Ativa</Badge>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          Ver Detalhes
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
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
