
import React, { useState } from 'react';
import { useFlows } from '@/hooks/useFlows';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Play, 
  Edit3, 
  Trash2, 
  Calendar,
  Users,
  Activity,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { CreateFlowDialog } from './CreateFlowDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export const FlowsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { flows, deleteFlow, isLoading } = useFlows();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFlows = [...filteredFlows].sort((a, b) => {
    const sortFactor = sortOrder === 'asc' ? 1 : -1;

    if (sortField === 'name') {
      return sortFactor * a.name.localeCompare(b.name);
    } else {
      const dateA = new Date(a[sortField] || 0).getTime();
      const dateB = new Date(b[sortField] || 0).getTime();
      return sortFactor * (dateB - dateA);
    }
  });

  const filteredAndSortedFlows = sortedFlows;

  const handleEdit = (flowId: string) => {
    navigate(`/flow-builder?edit=${flowId}`);
  };

  const handleDelete = async (flowId: string, flowName: string) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o fluxo "${flowName}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;

    try {
      await deleteFlow(flowId);
      toast.success('Fluxo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fluxo:', error);
      toast.error('Erro ao excluir fluxo. Tente novamente.');
    }
  };

  const handlePreview = (flow: any) => {
    if (!flow.nodes || flow.nodes.length === 0) {
      toast.error('Este fluxo não possui nós para visualizar.');
      return;
    }
    navigate(`/flow-preview/${flow.id}`);
  };

  const toggleSort = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {user?.role === 'patient' ? 'Dicas e Formulários' : 'Meus Fluxos'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'patient' 
              ? 'Acesse seus formulários e dicas personalizadas'
              : 'Gerencie seus fluxos de atendimento e formulários'
            }
          </p>
        </div>
        
        {user?.role !== 'patient' && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#5D8701] hover:bg-[#4a6e01] text-white shadow-lg hover-lift"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Fluxo
          </Button>
        )}
      </div>

      {/* Controls */}
      <Card className="mb-6 bg-white/50 dark:bg-[#0E0E0E]/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar fluxos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-[#1A1A1A]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSort}
                  className="text-xs dark:text-gray-300 dark:hover:bg-[#252525]"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                  {sortField === 'name' ? 'Nome' : sortField === 'created_at' ? 'Criação' : 'Atualização'}
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-[#1A1A1A]">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#5D8701] hover:bg-[#4a6e01]' : 'dark:text-gray-300 dark:hover:bg-[#252525]'}
                >
                  <Grid3X3 className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#5D8701] hover:bg-[#4a6e01]' : 'dark:text-gray-300 dark:hover:bg-[#252525]'}
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flows List */}
      {filteredAndSortedFlows.length === 0 ? (
        <Card className="bg-white/50 dark:bg-[#0E0E0E]/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'Nenhum fluxo encontrado' : 'Nenhum fluxo criado ainda'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              {searchTerm 
                ? `Não encontramos fluxos que correspondam à sua pesquisa por "${searchTerm}".`
                : user?.role === 'patient' 
                  ? 'Você ainda não possui formulários ou dicas disponíveis.'
                  : 'Comece criando seu primeiro fluxo de atendimento.'
              }
            </p>
            {!searchTerm && user?.role !== 'patient' && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#5D8701] hover:bg-[#4a6e01] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Fluxo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredAndSortedFlows.map((flow) => (
            <FlowCard 
              key={flow.id} 
              flow={flow} 
              viewMode={viewMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
              userRole={user?.role}
            />
          ))}
        </div>
      )}

      <CreateFlowDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

const FlowCard = ({ flow, viewMode, onEdit, onDelete, onPreview, userRole }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho'; 
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover-lift bg-white/70 dark:bg-[#0E0E0E]/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                  {flow.name}
                </h3>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(flow.status)}`}>
                  {getStatusText(flow.status)}
                </Badge>
              </div>
              {flow.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {flow.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(flow.updated_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {flow.nodes?.length || 0} nós
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(flow)}
                className="dark:text-gray-300 dark:hover:bg-[#1A1A1A]"
              >
                <Play className="h-4 w-4" />
              </Button>
              
              {userRole !== 'patient' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(flow.id)}
                    className="dark:text-gray-300 dark:hover:bg-[#1A1A1A]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(flow.id, flow.name)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift bg-white/70 dark:bg-[#0E0E0E]/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
              {flow.name}
            </CardTitle>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(flow.status)}`}>
              {getStatusText(flow.status)}
            </Badge>
          </div>
          
          {userRole !== 'patient' && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(flow.id)}
                className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-[#1A1A1A]"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(flow.id, flow.name)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {flow.description && (
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {flow.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(flow.updated_at).toLocaleDateString('pt-BR')}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {flow.nodes?.length || 0} nós
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(flow)}
          className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-[#1A1A1A]"
        >
          <Play className="h-3 w-3 mr-2" />
          {userRole === 'patient' ? 'Acessar' : 'Visualizar'}
        </Button>
      </CardContent>
    </Card>
  );
};
