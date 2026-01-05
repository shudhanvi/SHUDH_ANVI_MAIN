import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss()],
  server:{port: 5173},
  build: {
    chunkSizeWarningLimit: 1000, // increases limit to 1MB
  },
})  