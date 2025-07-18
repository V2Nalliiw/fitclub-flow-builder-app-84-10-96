
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
    console.log('[PWA] Inicializando PWA...');
    
    // Verificar se está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      const installed = isStandalone || isInWebApp;
      
      console.log('[PWA] Verificando instalação:', { isStandalone, isInWebApp, installed });
      setIsInstalled(installed);
    };

    checkInstalled();

    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt detectado!');
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    };

    // Listeners de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listener para app instalado
    const handleAppInstalled = () => {
      console.log('[PWA] App instalado!');
      setIsInstallable(false);
      setIsInstalled(true);
      deferredPrompt = null;
    };

    // Adicionar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    console.log('[PWA] Tentando mostrar prompt de instalação...');
    
    if (deferredPrompt) {
      try {
        const result = await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Resultado: ${outcome}`);
        
        if (outcome === 'accepted') {
          setIsInstallable(false);
        }
        
        deferredPrompt = null;
      } catch (error) {
        console.error('[PWA] Erro no prompt:', error);
      }
    } else {
      console.log('[PWA] Prompt não disponível');
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showInstallPrompt
  };
};
