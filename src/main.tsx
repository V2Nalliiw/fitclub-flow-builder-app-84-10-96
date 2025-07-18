
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Install Prompt Handler
let deferredPrompt: any;
let installButton: HTMLElement | null = null;

// Create install button dynamically
function createInstallButton() {
  if (installButton) return;
  
  installButton = document.createElement('button');
  installButton.innerHTML = '📱 Instalar App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background: #5D8701;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(93, 135, 1, 0.3);
    display: none;
    font-family: system-ui, -apple-system, sans-serif;
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('mouseenter', () => {
    if (installButton) {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(93, 135, 1, 0.4)';
    }
  });
  
  installButton.addEventListener('mouseleave', () => {
    if (installButton) {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(93, 135, 1, 0.3)';
    }
  });
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        hideInstallButton();
      }
      deferredPrompt = null;
    }
  });
  
  document.body.appendChild(installButton);
}

function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'block';
    console.log('[PWA] Install button shown');
  }
}

function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
    console.log('[PWA] Install button hidden');
  }
}

// Register service worker and handle install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register service worker
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

    // Create install button
    createInstallButton();
  });
}

// Handle PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt triggered');
  
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show custom install button
  showInstallButton();
  
  // Log that install is available
  console.log('[PWA] Install prompt available - showing install button');
});

// Handle app installed
window.addEventListener('appinstalled', (e) => {
  console.log('[PWA] App was installed successfully');
  hideInstallButton();
  deferredPrompt = null;
});

// Check if already installed (standalone mode)
window.addEventListener('DOMContentLoaded', () => {
  // Hide install button if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true) {
    console.log('[PWA] App is running in standalone mode');
    hideInstallButton();
  }
  
  // Also check for iOS standalone
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    console.log('[PWA] App is running in iOS standalone mode');
    hideInstallButton();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
