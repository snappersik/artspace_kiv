// File: /home/cookie/Рабочий стол/ильвина/artspace/frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      // Проксируем только известные префиксы API
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/artworks': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/artists': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/exhibitions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/tickets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
