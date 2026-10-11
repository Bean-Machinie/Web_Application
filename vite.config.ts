import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { assetSizes } from './vite-asset-sizes.ts'
import { landStamps } from './vite-land-stamps.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), assetSizes(), landStamps()],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
