import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FormulaHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaHelpModal: React.FC<FormulaHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajuda - Como usar Fórmulas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Operadores Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operadores Básicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">+</Badge>
                  <span className="text-sm">Adição</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">-</Badge>
                  <span className="text-sm">Subtração</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">*</Badge>
                  <span className="text-sm">Multiplicação</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">/</Badge>
                  <span className="text-sm">Divisão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">( )</Badge>
                  <span className="text-sm">Parênteses para prioridade</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">^</Badge>
                  <span className="text-sm">Potenciação</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regras de Sintaxe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regras de Sintaxe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">✅ Uso Correto:</h4>
                <div className="space-y-1 text-sm">
                  <div>• Use as nomenclaturas exatas dos campos: <code className="bg-muted px-1 rounded">peso + altura</code></div>
                  <div>• Adicione espaços entre operadores: <code className="bg-muted px-1 rounded">idade + 10</code></div>
                  <div>• Use parênteses para prioridade: <code className="bg-muted px-1 rounded">(peso + altura) * 2</code></div>
                  <div>• Para potências use ^: <code className="bg-muted px-1 rounded">altura ^ 2</code></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">❌ Evite:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• Operadores colados: <code className="bg-muted px-1 rounded">peso+altura</code></div>
                  <div>• Campos inexistentes: <code className="bg-muted px-1 rounded">campo_inexistente + 10</code></div>
                  <div>• Sintaxe incorreta: <code className="bg-muted px-1 rounded">peso ++ altura</code></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplos Práticos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exemplos Práticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Cálculo de IMC:</h4>
                <code className="bg-muted p-2 rounded block text-sm">peso / (altura ^ 2)</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Peso dividido pela altura ao quadrado
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Porcentagem de Gordura:</h4>
                <code className="bg-muted p-2 rounded block text-sm">(peso_gordura / peso_total) * 100</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Percentual de gordura em relação ao peso total
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Média Ponderada:</h4>
                <code className="bg-muted p-2 rounded block text-sm">(nota1 * peso1 + nota2 * peso2) / (peso1 + peso2)</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Cálculo de média com pesos diferentes
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Taxa Metabólica Basal (aproximada):</h4>
                <code className="bg-muted p-2 rounded block text-sm">10 * peso + 6.25 * altura - 5 * idade + 5</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Fórmula de Harris-Benedict simplificada (homens)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dicas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dicas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• <strong>Campos conectados:</strong> Só use nomenclaturas de campos que chegam até este nó</div>
                <div>• <strong>Números decimais:</strong> Use ponto (.) para decimais: <code className="bg-muted px-1 rounded">peso / 2.5</code></div>
                <div>• <strong>Validação:</strong> A fórmula é validada ao salvar</div>
                <div>• <strong>Resultado:</strong> O resultado será armazenado com o rótulo definido</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};