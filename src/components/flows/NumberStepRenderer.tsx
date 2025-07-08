import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hash, ArrowRight } from 'lucide-react';

interface NumberStepRendererProps {
  step: {
    nodeId: string;
    nodeType: string;
    nomenclatura?: string;
    prefixo?: string;
    sufixo?: string;
    tipoNumero?: 'inteiro' | 'decimal';
    label?: string;
  };
  onComplete: (response: any) => void;
  isLoading?: boolean;
}

export const NumberStepRenderer: React.FC<NumberStepRendererProps> = ({
  step,
  onComplete,
  isLoading = false
}) => {
  const [value, setValue] = useState<string>('');

  const handleSubmit = () => {
    const numericValue = step.tipoNumero === 'decimal' ? 
      parseFloat(value) : 
      parseInt(value);
    
    onComplete({
      nodeId: step.nodeId,
      nodeType: step.nodeType,
      nomenclatura: step.nomenclatura,
      value: numericValue,
      formattedValue: `${step.prefixo || ''}${value}${step.sufixo || ''}`,
      timestamp: new Date().toISOString()
    });
  };

  const isValid = value.trim() !== '' && !isNaN(Number(value));

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Hash className="h-5 w-5" />
          Campo Numérico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {step.nomenclatura || 'Digite um número'}
          </h3>
        </div>

        <div className="space-y-3">
          <Label htmlFor="number-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {step.label || `Informe o valor para ${step.nomenclatura}`}
          </Label>
          
          <div className="relative">
            {step.prefixo && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {step.prefixo}
              </span>
            )}
            
            <Input
              id="number-input"
              type="number"
              step={step.tipoNumero === 'decimal' ? '0.01' : '1'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={step.tipoNumero === 'decimal' ? '0.00' : '0'}
              className={`text-center text-lg ${step.prefixo ? 'pl-8' : ''} ${step.sufixo ? 'pr-8' : ''}`}
              autoFocus
            />
            
            {step.sufixo && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {step.sufixo}
              </span>
            )}
          </div>
          
          {value && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Valor formatado: {step.prefixo || ''}{value}{step.sufixo || ''}
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="bg-primary-gradient hover:opacity-90 text-white px-8 py-3 font-medium"
            size="lg"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                Confirmar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};