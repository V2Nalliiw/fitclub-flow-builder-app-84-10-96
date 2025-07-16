import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, RotateCcw, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface DelayTask {
  id: string;
  execution_id: string;
  patient_id: string;
  next_node_type: string;
  form_name: string;
  trigger_at: string;
  created_at: string;
  processed: boolean;
  processed_at?: string;
}

interface MonitorData {
  pendingTasks: DelayTask[];
  recentTasks: DelayTask[];
  totalPending: number;
  totalRecent: number;
}

export const DelayTaskMonitor: React.FC = () => {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testExecutionId, setTestExecutionId] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(1);
  const { toast } = useToast();

  const loadMonitorData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-delay-tasks', {
        body: { action: 'status' }
      });

      if (error) throw error;

      setMonitorData(data);
      toast({
        title: "Status atualizado",
        description: `${data.totalPending} tasks pendentes, ${data.totalRecent} processadas recentemente`,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestTask = async () => {
    if (!testExecutionId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de execução",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-delay-tasks', {
        body: {
          action: 'create-test',
          executionId: testExecutionId,
          delayMinutes
        }
      });

      if (error) throw error;

      toast({
        title: "Delay task criada",
        description: `Task de teste criada para ${delayMinutes} minuto(s)`,
      });

      await loadMonitorData();
    } catch (error) {
      console.error('Erro ao criar task:', error);
      toast({
        title: "Erro ao criar task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forceProcessTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-delay-tasks', {
        body: { action: 'force-process' }
      });

      if (error) throw error;

      toast({
        title: "Processamento forçado",
        description: `${data.tasksFound} tasks encontradas e processadas`,
      });

      await loadMonitorData();
    } catch (error) {
      console.error('Erro ao forçar processamento:', error);
      toast({
        title: "Erro no processamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWhatsApp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-delay-tasks', {
        body: { action: 'test-whatsapp' }
      });

      if (error) throw error;

      toast({
        title: data.success ? "WhatsApp OK" : "WhatsApp com problema",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro ao testar WhatsApp:', error);
      toast({
        title: "Erro no teste WhatsApp",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTimeDiff = (triggerAt: string) => {
    const now = new Date();
    const trigger = new Date(triggerAt);
    const diffMs = trigger.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 0) {
      return `Atrasado por ${Math.abs(diffMinutes)} min`;
    } else {
      return `Em ${diffMinutes} min`;
    }
  };

  useEffect(() => {
    loadMonitorData();
    const interval = setInterval(loadMonitorData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monitor de Delay Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Monitoramento e teste do sistema de delays automáticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMonitorData} disabled={loading} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={testWhatsApp} disabled={loading} variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Testar WhatsApp
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitorData?.totalPending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processadas Recentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitorData?.totalRecent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 10 processadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Testes do Sistema</CardTitle>
          <CardDescription>
            Ferramentas para testar e debugar o sistema de delays
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="executionId">ID da Execução</Label>
              <Input
                id="executionId"
                placeholder="uuid-da-execucao"
                value={testExecutionId}
                onChange={(e) => setTestExecutionId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delayMinutes">Delay (minutos)</Label>
              <Input
                id="delayMinutes"
                type="number"
                min="1"
                max="60"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ações</Label>
              <div className="flex gap-2">
                <Button onClick={createTestTask} disabled={loading || !testExecutionId}>
                  <Play className="w-4 h-4 mr-2" />
                  Criar Teste
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Button onClick={forceProcessTasks} disabled={loading} className="w-full">
            <AlertCircle className="w-4 h-4 mr-2" />
            Forçar Processamento de Todas as Tasks
          </Button>
        </CardContent>
      </Card>

      {/* Tasks Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Pendentes</CardTitle>
            <CardDescription>
              Tasks aguardando processamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitorData?.pendingTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {task.next_node_type}
                    </Badge>
                    <Badge variant="secondary">
                      {getTimeDiff(task.trigger_at)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <div><strong>Form:</strong> {task.form_name}</div>
                    <div><strong>Trigger:</strong> {formatDate(task.trigger_at)}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {task.execution_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              )) || <p className="text-muted-foreground text-center py-4">Nenhuma task pendente</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Processadas</CardTitle>
            <CardDescription>
              Últimas tasks processadas com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitorData?.recentTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {task.next_node_type}
                    </Badge>
                    <Badge variant="default">
                      Processada
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <div><strong>Form:</strong> {task.form_name}</div>
                    <div><strong>Processada:</strong> {formatDate(task.processed_at!)}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {task.execution_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              )) || <p className="text-muted-foreground text-center py-4">Nenhuma task processada</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};