import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { usePatientFlows } from '@/hooks/usePatientFlows';
import { useAuth } from '@/contexts/AuthContext';
import { FlowStepRenderer } from '@/components/flows/FlowStepRenderer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { MobileErrorBoundary } from '@/components/ui/mobile-error-boundary';

const FlowExecution = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execution, currentStep, isLoading, error, completeStep, canGoBack, goBack } = useFlowExecution(executionId!);
  const { completeStep: completePatientStep } = usePatientFlows();
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
    return (
      <MobileErrorBoundary>
        <div className="min-h-screen max-h-screen bg-white dark:bg-[#0E0E0E] flow-execution-container flex items-center justify-center p-4 sm:p-6">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">Carregando formulário...</p>
          </div>
        </div>
      </MobileErrorBoundary>
    );
  }

  if (error) {
    return (
      <MobileErrorBoundary>
        <div className="min-h-screen max-h-screen bg-white dark:bg-[#0E0E0E] flow-execution-container flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-[#0E0E0E] dark:border-gray-800 flow-step-card">
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
                  <Button 
                    onClick={() => navigate('/my-flows')}
                    className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos Formulários
                  </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileErrorBoundary>
    );
  }

  if (!currentStep) {
    return (
      <MobileErrorBoundary>
        <div className="min-h-screen max-h-screen bg-white dark:bg-[#0E0E0E] flow-execution-container flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-[#0E0E0E] dark:border-gray-800 flow-step-card">
            <CardContent className="py-16 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Formulário Concluído
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Você completou todas as etapas deste formulário.
              </p>
              <Button 
                onClick={() => navigate('/my-flows')}
                className="bg-[#5D8701] hover:bg-[#4a6e01] text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Formulários
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileErrorBoundary>
    );
  }

  return (
    <MobileErrorBoundary>
      <div className="min-h-screen max-h-screen bg-white dark:bg-[#0E0E0E] flow-execution-container overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col h-screen justify-center space-y-6">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-flows')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white bg-transparent dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Formulários
            </Button>
            
            {execution && (
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {execution.flow_name}
                </h1>
                {/* Não mostrar progresso fixo, será calculado dinamicamente */}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-muted-foreground mt-4">Carregando formulário...</p>
            </div>
          )}

          {error && (
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-[#0E0E0E] dark:border-gray-800 flow-step-card">
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
                  <Button 
                    onClick={() => navigate('/my-flows')}
                    className="w-full bg-[#5D8701] hover:bg-[#4a6e01] text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos Formulários
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && !currentStep && (
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-[#0E0E0E] dark:border-gray-800 flow-step-card">
              <CardContent className="py-16 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Formulário Concluído
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Você completou todas as etapas deste formulário.
                </p>
                <Button 
                  onClick={() => navigate('/my-flows')}
                  className="bg-[#5D8701] hover:bg-[#4a6e01] text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Formulários
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && currentStep && (
            <FlowStepRenderer
              step={currentStep}
              onComplete={handleStepComplete}
              onGoBack={canGoBack ? goBack : undefined}
              isLoading={isSubmitting}
              canGoBack={canGoBack}
              calculatorResult={currentStep.calculatorResult}
              calculatorResults={execution?.current_step?.calculatorResults || {}}
              questionResponses={execution?.current_step?.userResponses || {}}
            />
          )}
        </div>
      </div>
    </MobileErrorBoundary>
  );
};

export default FlowExecution;
