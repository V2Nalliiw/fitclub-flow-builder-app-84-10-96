
import { useState, useEffect } from 'react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  showInstallPrompt: () => void;
}

export const usePWA = (): PWAState => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebApp);
    };

    checkInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);

    // Listener para install prompt
    const handleInstallPrompt = () => {
      setIsInstallable(true);
    };

    window.addEventListener('pwa-install-available', handleInstallPrompt);

    // Listener para mudanças de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
      window.removeEventListener('pwa-install-available', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showInstallPrompt = () => {
    if ((window as any).showInstallPrompt) {
      (window as any).showInstallPrompt();
      setIsInstallable(false);
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showInstallPrompt
  };
};
