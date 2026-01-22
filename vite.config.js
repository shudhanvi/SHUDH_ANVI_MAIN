import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
 
export default defineConfig({
  plugins: [
    tailwindcss()],
  server:{port: 5173},
  proxy: {
      // Any request starting with '/gcs-data' will be redirected to Google Cloud
      '/gcs-data': {
        target: 'https://storage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gcs-data/, '')
      }
    },
  build: {
    chunkSizeWarningLimit: 1000, // increases limit to 1MB
  },
 
})  