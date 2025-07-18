import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { FlowBuilder } from "@/features/flows/components/FlowBuilder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { MobileErrorBoundary } from "@/components/ui/mobile-error-boundary";
import { Profile } from "@/pages/Profile";
import { Patients } from "@/pages/Patients";
import { Settings } from "@/pages/Settings";
import Team from "@/pages/Team";
import { Clinics } from "@/pages/Clinics";
import Customization from "@/pages/Customization";
import Preferences from "@/pages/Preferences";
import { Analytics } from "@/pages/Analytics";
import Permissions from "@/pages/Permissions";

import { WhatsAppSettings } from "@/pages/WhatsAppSettings";
import MyFlows from "@/pages/MyFlows";
import FlowExecution from "@/pages/FlowExecution";
import ConteudoFormulario from "@/pages/ConteudoFormulario";
import NotFound from "@/pages/NotFound";
import Help from "@/pages/Help";
import HelpSuperAdmin from "@/pages/help/HelpSuperAdmin";
import HelpClinic from "@/pages/help/HelpClinic";
import HelpPatient from "@/pages/help/HelpPatient";
import HelpProfessional from "@/pages/help/HelpProfessional";
import HelpManager from "@/pages/help/HelpManager";
import HelpAssistant from "@/pages/help/HelpAssistant";
import HelpViewer from "@/pages/help/HelpViewer";

import { RealtimeNotificationProvider } from "@/components/notifications/RealtimeNotificationProvider";
import { usePatientFlows } from "@/hooks/usePatientFlows";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['super_admin', 'clinic', 'patient'] 
}: { 
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'clinic' | 'patient')[];
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      return;
    }

    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, isLoading, allowedRoles, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </ErrorBoundary>
  );
};

// Componente para redirecionamento inteligente
const SmartRedirect = () => {
  const { user } = useAuth();
  const { executions, loading } = usePatientFlows();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Para pacientes, sempre redirecionar para o dashboard
  // onde ele pode ver os formulários disponíveis
  if (user?.role === 'patient') {
    console.log('SmartRedirect: Paciente logado - redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Para outros usuários, redirecionamento padrão
  return <Navigate to="/dashboard" replace />;
};

// Componente para tratar rotas não encontradas
const SmartNotFound = () => {
  const { user } = useAuth();
  
  // Se for paciente logado, redirecionar para dashboard ao invés de 404
  if (user?.role === 'patient') {
    console.log('SmartNotFound: Paciente tentou acessar URL inválida - redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Para outros usuários, mostrar página 404
  return <NotFound />;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<SmartRedirect />} />
      
      {/* Dashboard - Todos os usuários autenticados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Construtor de Fluxos - Apenas clínicas e super_admin */}
      <Route 
        path="/flows" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'super_admin']}>
            <FlowBuilder />
          </ProtectedRoute>
        } 
      />
      
      {/* Meus Fluxos - Todos os usuários */}
      <Route 
        path="/my-flows" 
        element={
          <ProtectedRoute>
            <MyFlows />
          </ProtectedRoute>
        } 
      />
      
      {/* Perfil - Todos os usuários */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Pacientes - Apenas clínicas e super_admin */}
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'super_admin']}>
            <Patients />
          </ProtectedRoute>
        } 
      />
      
      {/* Configurações - Baseado no papel */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      {/* WhatsApp - Apenas clínicas e super_admin */}
      <Route 
        path="/whatsapp-settings" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'super_admin']}>
            <WhatsAppSettings />
          </ProtectedRoute>
        } 
      />
      
      {/* Equipe - Apenas clínicas e super_admin */}
      <Route 
        path="/team" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'super_admin']}>
            <Team />
          </ProtectedRoute>
        } 
      />
      
      {/* Clínicas - Apenas super_admin */}
      <Route 
        path="/clinics" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Clinics />
          </ProtectedRoute>
        } 
      />
      
      {/* Personalização - Apenas super_admin */}
      <Route 
        path="/customization" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Customization />
          </ProtectedRoute>
        } 
      />
      
      {/* Preferências - Apenas super_admin */}
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Preferences />
          </ProtectedRoute>
        } 
      />
      
      {/* Analytics - Clínicas e super_admin */}
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'super_admin']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      
      {/* Permissões - Apenas super_admin */}
      <Route 
        path="/permissions" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Permissions />
          </ProtectedRoute>
        } 
      />
      
      {/* Help Pages - Todos os usuários */}
      <Route 
        path="/help" 
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/super-admin" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <HelpSuperAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/clinic" 
        element={
          <ProtectedRoute allowedRoles={['clinic', 'admin']}>
            <HelpClinic />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/manager" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <HelpManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/professional" 
        element={
          <ProtectedRoute allowedRoles={['professional']}>
            <HelpProfessional />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/assistant" 
        element={
          <ProtectedRoute allowedRoles={['assistant']}>
            <HelpAssistant />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/viewer" 
        element={
          <ProtectedRoute allowedRoles={['viewer']}>
            <HelpViewer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help/patient" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <HelpPatient />
          </ProtectedRoute>
        } 
      />
      
      
      {/* Flow Execution - Apenas pacientes */}
      <Route 
        path="/flow-execution/:executionId" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <FlowExecution />
          </ProtectedRoute>
        } 
      />
      
      {/* Conteúdo do Formulário - Acesso público */}
      <Route 
        path="/conteudo-formulario/:executionId" 
        element={<ConteudoFormulario />} 
      />
      
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<SmartNotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <MobileErrorBoundary>
          <ErrorBoundary>
            <TooltipProvider>
              <RealtimeNotificationProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </RealtimeNotificationProvider>
            </TooltipProvider>
          </ErrorBoundary>
        </MobileErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
