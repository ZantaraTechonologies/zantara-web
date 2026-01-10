import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: true, // if you still see 502, temporarily try secure:false to test TLS issues
        // rewrite: (path) => path, // not needed, keep /api prefix for the backend
        configure(proxy) {
          // optional: debug proxy issues in the terminal
          proxy.on('error', (err) => console.error('[proxy error]', err));
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy req]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[proxy res]', req.method, req.url, '->', proxyRes.statusCode);
          });
        },
      },
    },
  },
})
