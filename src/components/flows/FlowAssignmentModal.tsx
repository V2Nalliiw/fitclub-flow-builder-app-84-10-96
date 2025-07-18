
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePatients } from '@/hooks/usePatients';
import { useFlowAssignments } from '@/hooks/useFlowAssignments';
import { Flow } from '@/hooks/useFlows';

interface FlowAssignmentModalProps {
  flow: Flow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FlowAssignmentModal = ({ flow, isOpen, onClose }: FlowAssignmentModalProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { patients, loading: loadingPatients } = usePatients();
  const { assignFlow, isAssigning } = useFlowAssignments();

  const handleAssign = () => {
    if (!selectedPatientId || !flow) return;

    assignFlow({
      flowId: flow.id,
      patientId: selectedPatientId,
      notes: notes.trim() || undefined,
    });

    // Reset form and close modal
    setSelectedPatientId('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setSelectedPatientId('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Fluxo ao Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="flow-name">Fluxo Selecionado</Label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-[#0E0E0E] dark:border-gray-800 border rounded-md">
              <p className="font-medium text-gray-900 dark:text-gray-100">{flow?.name}</p>
              {flow?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{flow.description}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="patient-select">Selecionar Paciente</Label>
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
              disabled={loadingPatients}
            >
              <SelectTrigger className="mt-1 min-h-[44px] touch-manipulation">
                <SelectValue placeholder="Escolha um paciente" />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[200px] overflow-y-auto"
                position="popper"
                sideOffset={4}
              >
                {patients.map((patient) => (
                  <SelectItem 
                    key={patient.id} 
                    value={patient.user_id}
                    className="min-h-[44px] touch-manipulation cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-sm text-muted-foreground">{patient.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre esta atribuição..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleAssign}
              disabled={!selectedPatientId || isAssigning}
              className="flex-1"
            >
              {isAssigning ? 'Atribuindo...' : 'Atribuir Fluxo'}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isAssigning}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
