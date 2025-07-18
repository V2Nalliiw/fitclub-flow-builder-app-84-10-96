
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0E0E0E]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default Index;
