import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve('.'), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    define: {
      // Use fallback string to prevent build errors if key is missing in Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});