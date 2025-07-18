
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10MB
      },
      includeAssets: ['lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png'],
      manifest: {
        id: 'fitclub-app',
        name: 'FitClub - Emagrecimento Inteligente',
        short_name: 'FitClub',
        description: 'Plataforma inteligente para emagrecimento saudável e sustentável',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['health', 'fitness', 'medical'],
        icons: [
          {
            src: 'lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Acesso rápido ao dashboard',
            url: '/',
            icons: [
              {
                src: 'lovable-uploads/1806cbe5-c5a5-4b48-8ce8-83881e8f3acb.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          flow: ['@xyflow/react', 'react-beautiful-dnd'],
          utils: ['date-fns', 'uuid', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
}));
