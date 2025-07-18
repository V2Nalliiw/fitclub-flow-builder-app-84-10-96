
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, showInstallPrompt } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  // Banner offline
  if (!isOnline) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Você está offline</p>
              <p className="text-xs text-orange-600">Algumas funcionalidades podem estar limitadas</p>
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
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm bg-green-50 border-green-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-green-900">Instalar FitClub</h3>
            <p className="text-xs text-green-700">Acesso rápido na tela inicial</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={showInstallPrompt}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              Instalar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-8 w-8 p-0 text-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
