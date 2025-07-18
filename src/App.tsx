
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeNotificationProvider } from "@/components/notifications/RealtimeNotificationProvider";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import Index from "./pages/Index";
import FlowBuilder from "./pages/FlowBuilder";
import MyFlows from "./pages/MyFlows";
import Patients from "./pages/Patients";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import Permissions from "./pages/Permissions";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import FlowExecution from "./pages/FlowExecution";
import PatientDashboard from "./pages/PatientDashboard";
import ConteudoFormulario from "./pages/ConteudoFormulario";
import Clinics from "./pages/Clinics";
import Customization from "./pages/Customization";
import Forms from "./pages/Forms";
import WhatsAppSettings from "./pages/WhatsAppSettings";
import TestFormEnd from "./pages/TestFormEnd";

// Help sub-pages
import HelpManager from "./pages/help/HelpManager";
import HelpProfessional from "./pages/help/HelpProfessional";
import HelpAssistant from "./pages/help/HelpAssistant";
import HelpPatient from "./pages/help/HelpPatient";
import HelpViewer from "./pages/help/HelpViewer";
import HelpClinic from "./pages/help/HelpClinic";
import HelpSuperAdmin from "./pages/help/HelpSuperAdmin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <RealtimeNotificationProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/flow-builder" element={<FlowBuilder />} />
                  <Route path="/my-flows" element={<MyFlows />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/permissions" element={<Permissions />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/help/manager" element={<HelpManager />} />
                  <Route path="/help/professional" element={<HelpProfessional />} />
                  <Route path="/help/assistant" element={<HelpAssistant />} />
                  <Route path="/help/patient" element={<HelpPatient />} />
                  <Route path="/help/viewer" element={<HelpViewer />} />
                  <Route path="/help/clinic" element={<HelpClinic />} />
                  <Route path="/help/super-admin" element={<HelpSuperAdmin />} />
                  <Route path="/flow-execution/:executionId" element={<FlowExecution />} />
                  <Route path="/patient-dashboard/:executionId" element={<PatientDashboard />} />
                  <Route path="/conteudo-formulario/:executionId" element={<ConteudoFormulario />} />
                  <Route path="/clinics" element={<Clinics />} />
                  <Route path="/customization" element={<Customization />} />
                  <Route path="/forms" element={<Forms />} />
                  <Route path="/whatsapp-settings" element={<WhatsAppSettings />} />
                  <Route path="/test-form-end/:formId" element={<TestFormEnd />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PWAInstallBanner />
                <Toaster />
              </BrowserRouter>
            </RealtimeNotificationProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
