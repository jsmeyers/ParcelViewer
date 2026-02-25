import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@arcgis')) {
            return 'arcgis'
          }
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        'global': 'globalThis',
      },
    },
  },
})