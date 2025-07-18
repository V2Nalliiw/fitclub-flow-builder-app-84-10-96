
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
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
      },
      includeAssets: ['lovable-uploads/90973242-2117-408c-8564-774f9f6f4f30.png'],
      manifest: {
        name: 'FitClub - Emagrecimento Inteligente',
        short_name: 'FitClub',
        description: 'Plataforma inteligente para emagrecimento saudável e sustentável',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: 'lovable-uploads/90973242-2117-408c-8564-774f9f6f4f30.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
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
