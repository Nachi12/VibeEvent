import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to guarantee strict JavaScript/Wasm MIME types across all environments
const strictMimeTypesPlugin = () => ({
  name: 'strict-mime-types',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url || ''
      const cleanUrl = url.split('?')[0]
      if (
        cleanUrl.endsWith('.js') ||
        cleanUrl.endsWith('.mjs') ||
        cleanUrl.endsWith('.ts') ||
        cleanUrl.endsWith('.tsx') ||
        cleanUrl.endsWith('.jsx')
      ) {
        res.setHeader('Content-Type', 'text/javascript; charset=UTF-8')
      } else if (cleanUrl.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8')
      } else if (cleanUrl.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm')
      } else if (cleanUrl.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8')
      }
      res.setHeader('X-Content-Type-Options', 'nosniff')
      next()
    })
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url || ''
      const cleanUrl = url.split('?')[0]
      if (cleanUrl.endsWith('.js') || cleanUrl.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'text/javascript; charset=UTF-8')
      } else if (cleanUrl.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8')
      } else if (cleanUrl.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm')
      }
      res.setHeader('X-Content-Type-Options', 'nosniff')
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), strictMimeTypesPlugin()],
  server: {
    port: 5173,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  },
})
