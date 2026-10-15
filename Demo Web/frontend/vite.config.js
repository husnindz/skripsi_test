import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/predict': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/ai-recommendations': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
});
