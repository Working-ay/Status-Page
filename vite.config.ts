import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the local Vercel dev server if needed,
      // or mock it during pure Vite dev if backend isn't running.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});