
import { useState, useEffect } from 'react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  showInstallPrompt: () => void;
}

let deferredPrompt: any = null;

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
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
      console.log('[PWA] Install prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Listener para mudanças de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstallable(false);
      setIsInstalled(true);
      deferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      
      deferredPrompt = null;
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showInstallPrompt
  };
};
