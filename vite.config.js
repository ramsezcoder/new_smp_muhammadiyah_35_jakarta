import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    // Ensure JSON files are included in the bundle
    assetsInclude: ['**/*.json'],
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    host: true,
    // Removed API proxy - use static fallback instead
  }
});
