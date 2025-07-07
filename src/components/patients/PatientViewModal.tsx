import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail, Calendar, MapPin, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

export const PatientViewModal: React.FC<PatientViewModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <User className="h-5 w-5 text-[#5D8701]" />
            Informações do Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Perfil Principal */}
          <Card className="bg-gradient-to-r from-[#5D8701]/5 to-[#4a6e01]/5 dark:from-[#5D8701]/10 dark:to-[#4a6e01]/10 border-[#5D8701]/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={patient.avatar_url} alt={patient.name} />
                  <AvatarFallback className="bg-[#5D8701] text-white text-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      <Heart className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                    {patient.whatsapp_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                        WhatsApp Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Paciente desde {formatDistanceToNow(new Date(patient.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="bg-white/90 dark:bg-gray-950/90">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#5D8701]" />
                Informações de Contato
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{patient.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="bg-white/90 dark:bg-gray-950/90">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#5D8701]" />
                Estatísticas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                  <div className="text-xs text-blue-800 dark:text-blue-300">Formulários Ativos</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-xs text-green-800 dark:text-green-300">Concluídos</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">0%</div>
                  <div className="text-xs text-gray-800 dark:text-gray-300">Progresso</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};