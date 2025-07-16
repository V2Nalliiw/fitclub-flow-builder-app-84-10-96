import { useCallback } from 'react';

export const useDelayCalculator = () => {
  const calculateNextStepAvailableAt = useCallback((
    delayAmount: number, 
    delayType: 'minutos' | 'horas' | 'dias'
  ): string => {
    const now = new Date();
    let targetDate = new Date(now);

    console.log('🧮 Calculando próximo step disponível:', { 
      delayAmount, 
      delayType, 
      now: now.toISOString() 
    });

    switch (delayType) {
      case 'minutos':
        targetDate.setMinutes(now.getMinutes() + delayAmount);
        break;
      case 'horas':
        targetDate.setHours(now.getHours() + delayAmount);
        break;
      case 'dias':
        targetDate.setDate(now.getDate() + delayAmount);
        break;
      default:
        console.warn('❌ Tipo de delay não reconhecido:', delayType);
        targetDate.setMinutes(now.getMinutes() + 1); // Fallback: 1 minuto
    }

    const result = targetDate.toISOString();
    console.log('⏰ Data calculada para próximo step:', result);
    
    return result;
  }, []);

  const isDelayExpired = useCallback((availableAt: string): boolean => {
    const now = new Date();
    const targetDate = new Date(availableAt);
    return now >= targetDate;
  }, []);

  const formatTimeRemaining = useCallback((availableAt: string): string => {
    const now = new Date();
    const targetDate = new Date(availableAt);
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return 'Tempo expirado';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  return {
    calculateNextStepAvailableAt,
    isDelayExpired,
    formatTimeRemaining
  };
};