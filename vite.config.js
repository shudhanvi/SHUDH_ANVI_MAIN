import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // increases limit to 1MB
  },
})  