
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
    console.log('[PWA] Inicializando usePWA hook...');
    
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebApp;
      
      console.log('[PWA] Status instalação:', {
        isStandalone,
        isInWebApp,
        isInstalled,
        displayMode: window.matchMedia('(display-mode: standalone)').media
      });
      
      setIsInstalled(isInstalled);
    };

    checkInstalled();
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    // Listener para install prompt
    const handleInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt disparado!', e);
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
      
      // Forçar exibição do banner após um pequeno delay
      setTimeout(() => {
        console.log('[PWA] PWA instalável detectado - exibindo banner');
      }, 1000);
    };

    // Adicionar listeners para diferentes eventos de instalação
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    
    // Fallback para Safari/iOS
    const checkIOSInstallable = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone;
      
      if (isIOS && !isInStandaloneMode) {
        console.log('[PWA] iOS detectado - PWA instalável via Add to Home Screen');
        setIsInstallable(true);
      }
    };

    checkIOSInstallable();

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      console.log('[PWA] Conexão online restaurada');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('[PWA] Conexão offline detectada');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('[PWA] App foi instalado com sucesso!');
      setIsInstallable(false);
      setIsInstalled(true);
      deferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: verificar se o manifest está carregado
    if ('serviceWorker' in navigator) {
      console.log('[PWA] Service Worker suportado');
      navigator.serviceWorker.ready.then(() => {
        console.log('[PWA] Service Worker registrado e pronto');
      });
    }

    return () => {
      mediaQuery.removeEventListener('change', checkInstalled);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    console.log('[PWA] Tentando exibir prompt de instalação...', { deferredPrompt });
    
    if (deferredPrompt) {
      try {
        const result = await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Resultado do prompt: ${outcome}`, result);
        
        if (outcome === 'accepted') {
          setIsInstallable(false);
          console.log('[PWA] Usuário aceitou a instalação');
        } else {
          console.log('[PWA] Usuário rejeitou a instalação');
        }
        
        deferredPrompt = null;
      } catch (error) {
        console.error('[PWA] Erro ao exibir prompt:', error);
      }
    } else {
      // Fallback para iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar este app no iOS:\n1. Toque no botão de compartilhar\n2. Selecione "Adicionar à Tela de Início"');
      } else {
        console.log('[PWA] Nenhum prompt disponível');
      }
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showInstallPrompt
  };
};
