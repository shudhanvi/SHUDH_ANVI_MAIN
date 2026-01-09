import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,      // 👈 set your desired port
    strictPort: true // ❌ don’t auto-switch if port is busy
  },
})  