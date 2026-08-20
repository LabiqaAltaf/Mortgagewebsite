import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Use a single, stable dev port so the URL the user opens is predictable.
    port: 5173,
    strictPort: true,
    // Proxy all /api calls to the Express backend. This makes the dev front-end
    // and the backend same-origin, which eliminates CORS problems entirely — the
    // browser no longer cares which port Vite happens to run on.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
