import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSave: (updatedPatient: any) => Promise<void>;
}

export const PatientEditModal: React.FC<PatientEditModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    avatar_url: patient?.avatar_url || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({ ...patient, ...formData });
      toast.success('Paciente atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast.error('Erro ao atualizar paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-none dark:bg-[#0E0E0E]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Edit className="h-5 w-5 text-[#5D8701]" />
            Editar Paciente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <Card className="bg-gradient-to-r from-[#5D8701]/5 to-[#4a6e01]/5 dark:from-[#5D8701]/10 dark:to-[#4a6e01]/10 border-[#5D8701]/20">
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={formData.avatar_url} alt={formData.name} />
                <AvatarFallback className="bg-[#5D8701] text-white text-xl">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[#5D8701] text-[#5D8701] hover:bg-[#5D8701] hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
            </CardContent>
          </Card>

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                required
                className="border-gray-300 dark:border-gray-600 focus:border-[#5D8701] focus:ring-[#5D8701]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Digite o email"
                required
                className="border-gray-300 dark:border-gray-600 focus:border-[#5D8701] focus:ring-[#5D8701]"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Digite o telefone"
                className="border-gray-300 dark:border-gray-600 focus:border-[#5D8701] focus:ring-[#5D8701]"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#5D8701] text-white"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};