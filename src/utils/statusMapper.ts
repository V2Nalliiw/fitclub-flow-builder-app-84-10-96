
// Utility functions for mapping status between frontend (Portuguese) and database (English)

export const statusToDatabase = (frontendStatus: string): string => {
  const statusMap: Record<string, string> = {
    'atribuído': 'assigned',
    'assigned': 'assigned',
    'iniciado': 'pending',
    'started': 'pending',
    'em-andamento': 'pending',
    'pausado': 'paused',
    'paused': 'paused',
    'concluído': 'completed',
    'completed': 'completed',
    'aguardando': 'waiting',
    'waiting': 'waiting'
  };
  
  return statusMap[frontendStatus] || frontendStatus;
};

export const statusToFrontend = (databaseStatus: string): string => {
  const statusMap: Record<string, string> = {
    'assigned': 'Disponível',
    'pending': 'Em Andamento', 
    'paused': 'Pausado',
    'completed': 'Concluído',
    'waiting': 'Aguardando'
  };
  
  return statusMap[databaseStatus] || databaseStatus;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'assigned': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200',
    'paused': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200',
    'waiting': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-200';
};
