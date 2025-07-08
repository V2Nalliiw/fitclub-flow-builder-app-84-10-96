
// Utility functions for mapping status between frontend (Portuguese) and database (English)

export const statusToDatabase = (frontendStatus: string): string => {
  const statusMap: Record<string, string> = {
    'atribuído': 'pending',
    'assigned': 'pending',
    'iniciado': 'in-progress',
    'started': 'in-progress',
    'em-andamento': 'in-progress',
    'pausado': 'failed', // Using 'failed' as fallback for paused
    'paused': 'failed',
    'concluído': 'completed',
    'completed': 'completed',
    'aguardando': 'pending', // Using 'pending' for waiting
    'waiting': 'pending'
  };
  
  return statusMap[frontendStatus] || 'pending';
};

export const statusToFrontend = (databaseStatus: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Disponível',
    'in-progress': 'Em Andamento', 
    'failed': 'Pausado',
    'completed': 'Concluído'
  };
  
  return statusMap[databaseStatus] || databaseStatus;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'bg-muted text-muted-foreground border-muted',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200',
    'failed': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-200';
};
