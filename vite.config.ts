import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { assetSizes } from './vite-asset-sizes.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), assetSizes()],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
