
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';

interface ConditionsStepRendererProps {
  conditions: any[];
  calculatorResult: number;
  onComplete: () => void;
  isLoading?: boolean;
}

export const ConditionsStepRenderer: React.FC<ConditionsStepRendererProps> = ({
  conditions,
  calculatorResult,
  onComplete,
  isLoading = false
}) => {
  const getConditionIcon = (condition: any, isActive: boolean) => {
    if (!isActive) return <Info className="h-5 w-5 text-gray-400" />;
    
    switch (condition.severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-[#5D8701]" />;
    }
  };

  const getConditionColor = (condition: any, isActive: boolean) => {
    if (!isActive) return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50';
    
    switch (condition.severity) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20';
      case 'low':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-[#5D8701]/20 dark:border-[#5D8701]/30 bg-[#5D8701]/5 dark:bg-[#5D8701]/10';
    }
  };

  const getSeverityBadge = (severity: string, isActive: boolean) => {
    if (!isActive) return null;
    
    const variants = {
      high: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300',
      normal: 'bg-[#5D8701]/10 text-[#5D8701] dark:bg-[#5D8701]/20 dark:text-[#5D8701]'
    };

    const labels = {
      high: 'Alta Prioridade',
      medium: 'Média Prioridade',
      low: 'Baixa Prioridade',
      normal: 'Normal'
    };

    return (
      <Badge className={variants[severity as keyof typeof variants] || variants.normal}>
        {labels[severity as keyof typeof labels] || 'Normal'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8" />
          <div>
            <h3 className="text-xl font-semibold">Avaliação de Condições</h3>
            <p className="text-white/90">Baseado no seu resultado: {calculatorResult.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Conditions List */}
      <div className="space-y-4">
        {conditions.map((condition, index) => {
          const isActive = calculatorResult >= (condition.minValue || 0) && 
                          calculatorResult <= (condition.maxValue || Infinity);
          
          return (
            <div
              key={index}
              className={`rounded-lg border-2 p-4 transition-all ${getConditionColor(condition, isActive)}`}
            >
              <div className="flex items-start gap-3">
                {getConditionIcon(condition, isActive)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${
                      isActive 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {condition.title}
                    </h4>
                    {getSeverityBadge(condition.severity, isActive)}
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    isActive 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {condition.description}
                  </p>

                  {condition.recommendations && isActive && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded border">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Recomendações:
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {condition.recommendations.map((rec: string, recIndex: number) => (
                          <li key={recIndex} className="flex items-start gap-2">
                            <span className="text-[#5D8701] font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {condition.range && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Faixa de valores: {condition.range}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#5D8701] to-[#4a6e01] hover:from-[#4a6e01] hover:to-[#3a5701] text-white px-8 py-3 text-lg"
        >
          {isLoading ? 'Processando...' : 'Continuar'}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
