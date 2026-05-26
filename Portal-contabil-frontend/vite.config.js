import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Aqui está a mágica para resolver o erro do SockJS
    global: 'window',
  },
})
