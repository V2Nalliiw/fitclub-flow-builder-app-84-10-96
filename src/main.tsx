
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registrar service worker
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('[PWA] Nova versão disponível');
    },
    onOfflineReady() {
      console.log('[PWA] App pronto para funcionar offline');
    },
    onRegistered(r) {
      console.log('[PWA] Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.log('[PWA] Erro ao registrar Service Worker:', error);
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
