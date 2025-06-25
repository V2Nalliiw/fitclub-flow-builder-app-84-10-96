
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FlowPreview } from './FlowPreview';
import { Node, Edge } from '@xyflow/react';

interface FlowPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  flowName: string;
}

export const FlowPreviewModal: React.FC<FlowPreviewModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  flowName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {flowName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <FlowPreview nodes={nodes} edges={edges} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
