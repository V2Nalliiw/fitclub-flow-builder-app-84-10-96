import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { usePatientFlows } from '@/hooks/usePatientFlows';
import { useAuth } from '@/contexts/AuthContext';
import { FlowStepRenderer } from '@/components/flows/FlowStepRenderer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react';
import { MobileErrorBoundary } from '@/components/ui/mobile-error-boundary';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useBreakpoints } from '@/hooks/use-breakpoints';
const FlowExecution = () => {
  const {
    executionId
  } = useParams<{
    executionId: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    execution,
    currentStep,
    isLoading,
    error,
    completeStep,
    canGoBack,
    goBack
  } = useFlowExecution(executionId!);
  const {
    completeStep: completePatientStep
  } = usePatientFlows();
  const { isMobile, isTablet } = useBreakpoints();
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    // Add meta tag to prevent Google Translate interference on mobile
    const metaTag = document.createElement('meta');
    metaTag.name = 'google';
    metaTag.content = 'notranslate';
    document.head.appendChild(metaTag);

    // Cleanup function
    return () => {
      const existingMeta = document.querySelector('meta[name="google"]');
      if (existingMeta) {
        document.head.removeChild(existingMeta);
      }
    };
  }, []);
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (execution && execution.status === 'concluido') {
      // Redirect to my-flows if the flow is already completed
      navigate('/my-flows');
    }
  }, [user, navigate, execution]);
  const handleStepComplete = async (response: any) => {
    setIsSubmitting(true);
    try {
      if (executionId) {
        await completeStep(response);
        await completePatientStep(executionId, currentStep?.nodeId, response);
      } else {
        console.error("Execution ID is missing");
      }
    } catch (error) {
      console.error("Error completing step:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return <MobileErrorBoundary>
        <div className="h-screen bg-white dark:bg-[#0B0B0B] flow-execution-container flex items-center justify-center p-4 sm:p-6">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">Carregando formulário...</p>
          </div>
        </div>
      </MobileErrorBoundary>;
  }
  if (error) {
    return <MobileErrorBoundary>
        <div className="h-screen bg-white dark:bg-[#0B0B0B] flow-execution-container flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-[#0B0B0B] dark:border-gray-800 flow-step-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                Erro ao carregar formulário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <div className="space-y-2">
                  <Button onClick={() => navigate('/my-flows')} className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos Formulários
                  </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileErrorBoundary>;
  }
  if (!currentStep) {
    // Redireciona automaticamente sem mostrar mensagem de conclusão
    navigate('/my-flows');
    return null;
  }
  return <MobileErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#0B0B0B] flow-execution-container">
        {/* Nome do Fluxo Fixo no Topo */}
        {execution && <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
              {execution.flow_name}
            </h1>
          </div>}
        
        {/* Botão Dark Mode Flutuante */}
        {!isLoading && !error && currentStep && <div className="fixed top-4 right-4 z-[60]">
            <ThemeToggle />
          </div>}
        
        {/* Botão Meus Fluxos para Mobile e Tablet */}
        {!isLoading && !error && currentStep && <div className="fixed top-4 left-4 z-[60] xl:hidden">
            
          </div>}
        
        {/* Espaçamento para o header fixo */}
        <div className={`pt-20 ${(isMobile || isTablet) ? 'pb-[15vh]' : ''}`}>
          <div className="w-full max-w-2xl mx-auto">
            {isLoading && <div className="text-center bg-white dark:bg-[#0B0B0B] rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-800">
                <LoadingSpinner />
                <p className="text-muted-foreground mt-4">Carregando formulário...</p>
              </div>}

            {error && <Card className="max-w-md mx-auto shadow-xl border-0 bg-white dark:bg-[#0B0B0B] dark:border-gray-800 flow-step-card">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                    Erro ao carregar formulário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {error}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => navigate('/my-flows')} className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar aos Formulários
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>}


            {!isLoading && !error && currentStep && <div className="w-full">
                <FlowStepRenderer step={currentStep} onComplete={handleStepComplete} onGoBack={(isMobile || isTablet) ? undefined : (canGoBack ? goBack : undefined)} isLoading={isSubmitting} canGoBack={canGoBack && !(isMobile || isTablet)} calculatorResult={currentStep.calculatorResult} calculatorResults={execution?.current_step?.calculatorResults || {}} questionResponses={execution?.current_step?.userResponses || {}} />
              </div>}
          </div>

          {/* Botões Flutuantes */}
          {!isLoading && !error && currentStep && <div className={`fixed left-1/2 transform -translate-x-1/2 flex gap-3 z-50 ${(isMobile || isTablet) ? 'bottom-[12vh]' : 'bottom-6'}`}>
              {canGoBack && <Button variant="outline" onClick={goBack} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>}
              <Button variant="outline" onClick={() => navigate('/my-flows')} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-shadow">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Formulários
              </Button>
            </div>}
        </div>

        {/* Mobile Navigation com blur - Show only on mobile and tablet */}
        {(isMobile || isTablet) && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="backdrop-blur-md bg-card/80 border-t border-border/50">
              <MobileNavigation />
            </div>
          </div>
        )}
      </div>
    </MobileErrorBoundary>;
};
export default FlowExecution;