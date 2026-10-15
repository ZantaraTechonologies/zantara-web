import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  if (mode !== 'development') {
    const value = String(env.VITE_API_BASE_URL || '').trim()
    if (!value) throw new Error('VITE_API_BASE_URL is required for non-development builds')
    const apiOrigin = new URL(value)
    if (apiOrigin.protocol !== 'https:' || apiOrigin.username || apiOrigin.password
      || apiOrigin.pathname !== '/' || apiOrigin.search || apiOrigin.hash) {
      throw new Error('VITE_API_BASE_URL must be an HTTPS origin without credentials, path, query, or fragment')
    }
  }

  return {
    plugins: [
      react(),
      compression({ algorithm: 'gzip', threshold: 10240 }),
      compression({ algorithm: 'brotliCompress', threshold: 10240 }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: true,
          configure(proxy) {
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
  }
})
