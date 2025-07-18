
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker and handle install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('PWA install prompt available');
  
  // Show a custom install button or notification here if desired
  // For now, we'll just log that it's available
});

createRoot(document.getElementById("root")!).render(<App />);
