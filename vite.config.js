import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'webgi': ['webgi'],
          'gsap': ['gsap']
        }
      }
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
    open: true
  }
})
