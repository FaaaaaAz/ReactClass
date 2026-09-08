import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // El front pide al mismo origen (:5173) y Vite reenvia al backend (:3000).
      "/saludo": "http://localhost:3000",
      "/api": "http://localhost:3000",
    },
  },
})
