import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow access from network for mobile testing
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '42983eef.r7.cpolar.cn', // Cpolar public domain
      '.cpolar.cn' // Allow all cpolar subdomains
    ],
    // 性能优化
    hmr: {
      overlay: false // 禁用错误覆盖层以减少网络传输
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // PWA optimization
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'sonner'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});