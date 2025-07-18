
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, showInstallPrompt } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm md:left-auto md:max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Instalar FitClub</h3>
              <p className="text-xs text-muted-foreground">
                Acesso rápido na tela inicial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={showInstallPrompt}
              className="h-8 px-3 text-xs"
            >
              Instalar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
