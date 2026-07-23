import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    // Anything the app fetches from /api is forwarded to the Express server,
    // so the browser only ever sees one origin — no CORS in dev, and the
    // fetch paths stay identical when the app is built for production.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
