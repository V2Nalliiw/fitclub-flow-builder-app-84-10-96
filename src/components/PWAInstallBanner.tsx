
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, showInstallPrompt } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  // Log para debug
  React.useEffect(() => {
    console.log('[PWAInstallBanner] Estado atual:', {
      isInstallable,
      isInstalled,
      isOnline,
      dismissed
    });
  }, [isInstallable, isInstalled, isOnline, dismissed]);

  // Banner de status offline
  if (!isOnline) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm md:left-auto md:max-w-md bg-orange-50 border-orange-200 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Você está offline
              </p>
              <p className="text-xs text-orange-600">
                Algumas funcionalidades podem estar limitadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner de instalação
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm md:left-auto md:max-w-md bg-green-50 border-green-200 shadow-lg animate-in slide-in-from-bottom-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white flex-shrink-0">
              <Download className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-green-900">
                Instalar FitClub
              </h3>
              <p className="text-xs text-green-700 truncate">
                Acesso rápido na tela inicial do seu dispositivo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => {
                console.log('[PWAInstallBanner] Botão instalar clicado');
                showInstallPrompt();
              }}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
            >
              Instalar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('[PWAInstallBanner] Banner dispensado');
                setDismissed(true);
              }}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
