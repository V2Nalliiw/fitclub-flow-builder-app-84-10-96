
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePatients } from '@/hooks/usePatients';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, Phone, Mail, Edit, Trash2, Eye, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientViewModal } from './PatientViewModal';
import { PatientEditModal } from './PatientEditModal';
import { PatientFeedbackModal } from './PatientFeedbackModal';
import { usePatientResponses } from '@/hooks/usePatientResponses';
import { toast } from 'sonner';

const PatientCard = ({ patient, onView, onEdit, onFeedback, onDelete }: {
  patient: any;
  onView: () => void;
  onEdit: () => void;
  onFeedback: () => void;
  onDelete: () => void;
}) => {
  const { responseCount } = usePatientResponses(patient.user_id);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 card-standard">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary-gradient"></div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={patient.avatar_url} alt={patient.name} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-lg">
                {patient.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100 truncate">
                {patient.name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {patient.email}
              </p>
            </div>
          </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary flex-shrink-0">
              Ativo
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {patient.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{patient.phone}</span>
            {patient.whatsapp_verified && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                WhatsApp
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-gray-500 dark:text-gray-400">
            Cadastrado {formatDistanceToNow(new Date(patient.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>

        {/* Botões de Ação - Apenas Ícones */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={onView}
            className="border-primary text-primary hover:bg-primary hover:text-white p-2"
            title="Ver detalhes do paciente"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onEdit}
            className="border-muted-foreground/30 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary p-2"
            title="Editar paciente"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onFeedback}
            className="border-muted-foreground/30 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary p-2 relative"
            title={`Ver ${responseCount} respostas do paciente`}
          >
            <MessageSquare className="h-4 w-4" />
            {responseCount > 0 && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {responseCount}
              </Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive p-2"
            title="Remover paciente"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const PatientsActiveList = () => {
  const { patients, loading, deletePatient } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient);
    setEditModalOpen(true);
  };

  const handleFeedbackPatient = (patient: any) => {
    setSelectedPatient(patient);
    setFeedbackModalOpen(true);
  };

  const handleSavePatient = async (updatedPatient: any) => {
    // Mock save function - replace with real implementation
    console.log('Saving patient:', updatedPatient);
    toast.success('Paciente atualizado com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="text-muted-foreground ml-2">Carregando pacientes...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Nenhum paciente ativo</p>
        <p className="text-muted-foreground text-center">
          Os pacientes aparecerão aqui quando se juntarem à sua clínica
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onView={() => handleViewPatient(patient)}
            onEdit={() => handleEditPatient(patient)}
            onFeedback={() => handleFeedbackPatient(patient)}
            onDelete={() => deletePatient(patient.id)}
          />
        ))}
      </div>

      {/* Modals */}
      <PatientViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />

      <PatientEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />

      <PatientFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </>
  );
};
