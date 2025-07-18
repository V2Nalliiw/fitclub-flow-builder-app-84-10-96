import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';

interface DraftRecoveryDialogProps {
  isOpen: boolean;
  onLoadDraft: () => void;
  onStartFresh: () => void;
  draftTimestamp: number;
  draftName?: string;
}

export const DraftRecoveryDialog: React.FC<DraftRecoveryDialogProps> = ({
  isOpen,
  onLoadDraft,
  onStartFresh,
  draftTimestamp,
  draftName
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'há menos de 1 minuto';
    } else if (diffMins < 60) {
      return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Rascunho Encontrado
          </DialogTitle>
          <DialogDescription>
            Encontramos um rascunho não salvo do seu último trabalho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última modificação: {formatTime(draftTimestamp)}</span>
            </div>
            {draftName && (
              <div className="text-sm">
                <span className="font-medium">Nome: </span>
                <span>{draftName || 'Sem nome'}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Deseja continuar de onde parou ou começar um novo fluxo?
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onStartFresh}
            className="flex-1"
          >
            Começar do Zero
          </Button>
          <Button
            onClick={onLoadDraft}
            className="flex-1"
          >
            Carregar Rascunho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};