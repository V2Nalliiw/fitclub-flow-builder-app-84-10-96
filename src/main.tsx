
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] SW registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] SW update found');
        });
      })
      .catch((registrationError) => {
        console.log('[PWA] SW registration failed:', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
