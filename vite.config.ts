import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Define process.env.API_KEY to make it available in the client-side code,
  // supporting the change in geminiService.ts.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
