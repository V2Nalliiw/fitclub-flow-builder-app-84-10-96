
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Workbox } from 'workbox-window';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const wb = new Workbox('/sw.js');
    
    // Evento quando uma nova versão está disponível
    wb.addEventListener('waiting', (event) => {
      console.log('[PWA] New version available, updating...');
      
      // Mostrar notificação para o usuário sobre update
      if (confirm('Nova versão disponível! Deseja atualizar?')) {
        wb.messageSkipWaiting();
        window.location.reload();
      }
    });

    // Evento quando o service worker toma controle
    wb.addEventListener('controlling', (event) => {
      console.log('[PWA] New service worker is controlling the page');
      window.location.reload();
    });

    // Registrar o service worker
    wb.register()
      .then((registration) => {
        console.log('[PWA] SW registered successfully:', registration);
        
        // Verificar por updates periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Verificar a cada 1 minuto
      })
      .catch((registrationError) => {
        console.log('[PWA] SW registration failed:', registrationError);
      });

    // Fallback para service worker custom se Workbox falhar
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Custom SW registered as fallback:', registration);
        
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] SW update found - v10');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                console.log('[PWA] New content available, reload required');
                if (navigator.serviceWorker.controller) {
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    window.location.reload();
                  }
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('[PWA] Custom SW registration failed:', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt ready');
  
  // Salvar o evento para uso posterior (em um botão de instalação)
  window.dispatchEvent(new CustomEvent('pwa-install-available'));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App was installed');
  deferredPrompt = null;
});

// Função global para trigger do install prompt
(window as any).showInstallPrompt = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User choice: ${outcome}`);
    deferredPrompt = null;
  }
};

createRoot(document.getElementById("root")!).render(<App />);
