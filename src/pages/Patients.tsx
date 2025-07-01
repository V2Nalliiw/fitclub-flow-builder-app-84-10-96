
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HybridPatientInvitationDialog } from '@/components/patients/HybridPatientInvitationDialog';
import { HybridPatientInvitationsList } from '@/components/patients/HybridPatientInvitationsList';
import { PatientsActiveList } from '@/components/patients/PatientsActiveList';
import { Users, UserPlus, Mail, Bell } from 'lucide-react';

export const Patients = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e convites da clínica
          </p>
        </div>
        <HybridPatientInvitationDialog />
      </div>

      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Convites</span>
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Pacientes Ativos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Convites por Email
              </CardTitle>
              <CardDescription>
                Acompanhe o status dos convites enviados por email para novos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HybridPatientInvitationsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Convites Internos
              </CardTitle>
              <CardDescription>
                Convites enviados para pacientes já cadastrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Sistema de notificações interno</p>
                <p className="text-muted-foreground text-center">
                  Os convites internos aparecem como notificações no dashboard dos pacientes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pacientes Ativos
              </CardTitle>
              <CardDescription>
                Lista de pacientes ativos em sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientsActiveList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
