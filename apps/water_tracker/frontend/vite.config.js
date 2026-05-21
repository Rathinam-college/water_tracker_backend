import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/water_tracker/',
  plugins: [react()],
  server: {
    host: false,
  },
})
