import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { hallowPlugin } from './vite-plugin-hallow';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    hallowPlugin({
      enabled: true,
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.proto'],
  },
});