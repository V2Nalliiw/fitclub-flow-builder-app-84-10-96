import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { FlowBuilder } from "@/features/flows/components/FlowBuilder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Profile } from "@/pages/Profile";
import { Patients } from "@/pages/Patients";
import { Settings } from "@/pages/Settings";
import { Team } from "@/pages/Team";
import { Clinics } from "@/pages/Clinics";
import { Customization } from "@/pages/Customization";
import { Preferences } from "@/pages/Preferences";
import { Analytics } from "@/pages/Analytics";
import { Permissions } from "@/pages/Permissions";
import { Forms } from "@/pages/Forms";
import MyFlows from "@/pages/MyFlows";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
    <ErrorBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </ErrorBoundary>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/flows" 
        element={
          <ProtectedRoute>
            <FlowBuilder />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-flows" 
        element={
          <ProtectedRoute>
            <MyFlows />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clinics" 
        element={
          <ProtectedRoute>
            <Clinics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customization" 
        element={
          <ProtectedRoute>
            <Customization />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/permissions" 
        element={
          <ProtectedRoute>
            <Permissions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forms" 
        element={
          <ProtectedRoute>
            <Forms />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
